package app

import (
  "bytes"
  "context"
  "encoding/json"
  "errors"
  "fmt"
  "io"
  "log"
  "math"
  "net/http"
  "os"
  "strconv"
  "strings"
  "time"

  "github.com/go-chi/chi/v5"
  "github.com/go-chi/chi/v5/middleware"
  "github.com/golang-jwt/jwt/v5"
  "github.com/jackc/pgx/v5/pgxpool"
  "github.com/xuri/excelize/v2"
  "golang.org/x/crypto/bcrypt"
)

type ctxKey string

const userCtxKey ctxKey = "auth_user"

type AuthUser struct {
  ID string `json:"id"`
  Role string `json:"role"`
  Email string `json:"email"`
  Nama string `json:"nama"`
}

type App struct {
  db *pgxpool.Pool
  secret []byte
  port string
  frontendURL string
}

func New() (*App, error) {
  dsn := strings.TrimSpace(os.Getenv("DATABASE_URL"))
  if dsn == "" {
    return nil, errors.New("DATABASE_URL is required")
  }
  sec := strings.TrimSpace(os.Getenv("JWT_SECRET"))
  if sec == "" {
    return nil, errors.New("JWT_SECRET is required")
  }
  cfg, err := pgxpool.ParseConfig(dsn)
  if err != nil {
    return nil, err
  }
  db, err := pgxpool.NewWithConfig(context.Background(), cfg)
  if err != nil {
    return nil, err
  }
  if err := db.Ping(context.Background()); err != nil {
    return nil, err
  }
  port := strings.TrimSpace(os.Getenv("PORT"))
  if port == "" {
    port = "5000"
  }
  frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
  if frontendURL == "" {
    frontendURL = "http://localhost:5173"
  }
  return &App{db: db, secret: []byte(sec), port: port, frontendURL: frontendURL}, nil
}

func (a *App) Run() error {
  r := chi.NewRouter()
  r.Use(middleware.RequestID)
  r.Use(middleware.RealIP)
  r.Use(middleware.Recoverer)
  r.Use(a.cors)

  r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
    respond(w, 200, map[string]any{"success": true, "message": "Server is running", "timestamp": time.Now().Format(time.RFC3339)})
  })

  r.Route("/api", func(api chi.Router) {
    api.Route("/auth", func(ar chi.Router) {
      ar.Post("/login", a.login)
      ar.With(a.auth).Post("/register", a.register)
      ar.With(a.auth).Get("/me", a.me)
      ar.With(a.auth).Put("/me", a.updateMe)
      ar.With(a.auth).Put("/change-password", a.changePassword)
    })

    api.Group(func(p chi.Router) {
      p.Use(a.auth)
      p.Mount("/users", a.usersRoutes())
      p.Mount("/sekolah", a.sekolahRoutes())
      p.Mount("/siswa", a.siswaRoutes())
      p.Mount("/mapel", a.mapelRoutes())
      p.Mount("/ekstra", a.ekstraRoutes())
      p.Mount("/penilaian", a.penilaianRoutes())
    })
  })

  r.NotFound(func(w http.ResponseWriter, r *http.Request) {
    respond(w, 404, map[string]any{"success": false, "message": "Route not found"})
  })

  log.Printf("Go backend running on http://localhost:%s", a.port)
  return http.ListenAndServe(":"+a.port, r)
}

func (a *App) cors(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", a.frontendURL)
    w.Header().Set("Access-Control-Allow-Credentials", "true")
    w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if r.Method == http.MethodOptions {
      w.WriteHeader(204)
      return
    }
    next.ServeHTTP(w, r)
  })
}

func (a *App) auth(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    h := strings.TrimSpace(r.Header.Get("Authorization"))
    if !strings.HasPrefix(h, "Bearer ") {
      respond(w, 401, map[string]any{"success": false, "message": "Token tidak ditemukan. Silakan login terlebih dahulu."})
      return
    }
    tokenStr := strings.TrimSpace(strings.TrimPrefix(h, "Bearer "))
    claims := jwt.MapClaims{}
    token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
      return a.secret, nil
    })
    if err != nil || !token.Valid {
      respond(w, 403, map[string]any{"success": false, "message": "Token tidak valid."})
      return
    }
    uid := toStr(claims["userId"])
    row, err := a.one(r.Context(), "SELECT id,email,nama,role,status FROM users WHERE id=$1", uid)
    if err != nil || row == nil {
      respond(w, 401, map[string]any{"success": false, "message": "User tidak ditemukan."})
      return
    }
    if toStr(row["status"]) != "aktif" {
      respond(w, 403, map[string]any{"success": false, "message": "Akun Anda telah dinonaktifkan. Hubungi administrator."})
      return
    }
    u := AuthUser{ID: toStr(row["id"]), Role: toStr(row["role"]), Email: toStr(row["email"]), Nama: toStr(row["nama"])}
    next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userCtxKey, u)))
  })
}

func currentUser(r *http.Request) *AuthUser {
  v, ok := r.Context().Value(userCtxKey).(AuthUser)
  if !ok { return nil }
  return &v
}

func (a *App) authorizeHierarchy(min string) func(http.Handler) http.Handler {
  lv := map[string]int{"guru": 1, "wali_kelas": 2, "admin": 3, "superadmin": 4}
  req := lv[min]
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      u := currentUser(r)
      if u == nil || lv[u.Role] < req {
        respond(w, 403, map[string]any{"success": false, "message": "Anda tidak memiliki izin yang cukup.", "yourRole": roleOrAnon(u), "requiredRole": min})
        return
      }
      next.ServeHTTP(w, r)
    })
  }
}

func (a *App) authorize(roles ...string) func(http.Handler) http.Handler {
  allow := map[string]bool{}
  for _, r := range roles { allow[r] = true }
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      u := currentUser(r)
      if u == nil || !allow[u.Role] {
        respond(w, 403, map[string]any{"success": false, "message": "Anda tidak memiliki akses ke resource ini.", "required": roles, "yourRole": roleOrAnon(u)})
        return
      }
      next.ServeHTTP(w, r)
    })
  }
}

func roleOrAnon(u *AuthUser) string {
  if u == nil { return "unauthenticated" }
  return u.Role
}

func (a *App) login(w http.ResponseWriter, r *http.Request) {
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  email := strings.TrimSpace(toStr(body["email"]))
  pass := toStr(body["password"])
  if email == "" || pass == "" {
    respond(w, 400, map[string]any{"success": false, "message": "Email dan password wajib diisi."})
    return
  }
  user, err := a.one(r.Context(), "SELECT id,email,password,nama,nip,role,foto,telepon,status FROM users WHERE email=$1 OR nip=$1 LIMIT 1", email)
  if err != nil || user == nil { respond(w, 401, map[string]any{"success": false, "message": "Email atau password salah."}); return }
  if bcrypt.CompareHashAndPassword([]byte(toStr(user["password"])), []byte(pass)) != nil {
    respond(w, 401, map[string]any{"success": false, "message": "Email atau password salah."}); return
  }
  if toStr(user["status"]) != "aktif" {
    respond(w, 403, map[string]any{"success": false, "message": "Akun Anda telah dinonaktifkan. Hubungi administrator."}); return
  }
  _, _ = a.db.Exec(r.Context(), "UPDATE users SET terakhir_login=NOW() WHERE id=$1", user["id"])
  token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"userId": user["id"], "email": user["email"], "role": user["role"], "exp": time.Now().Add(24*time.Hour).Unix()})
  tokenStr, _ := token.SignedString(a.secret)
  respond(w, 200, map[string]any{"success": true, "message": "Login berhasil.", "data": map[string]any{"token": tokenStr, "user": map[string]any{"id": user["id"], "email": user["email"], "nama": user["nama"], "nip": user["nip"], "role": user["role"], "foto": user["foto"], "telepon": user["telepon"]}}})
}

func (a *App) register(w http.ResponseWriter, r *http.Request) {
  u := currentUser(r)
  if u == nil || (u.Role != "superadmin" && u.Role != "admin") { respond(w, 403, map[string]any{"success": false, "message": "Hanya admin yang dapat mendaftarkan user baru."}); return }
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  email := strings.TrimSpace(toStr(body["email"]))
  password := toStr(body["password"])
  nama := strings.TrimSpace(toStr(body["nama"]))
  nip := nullIfEmpty(body["nip"])
  role := toStr(body["role"])
  if role == "" { role = "guru" }
  if role == "superadmin" && u.Role != "superadmin" { respond(w, 403, map[string]any{"success": false, "message": "Hanya superadmin yang dapat mendaftarkan superadmin baru."}); return }
  if email == "" || password == "" || nama == "" { respond(w, 400, map[string]any{"success": false, "message": "Email, password, dan nama wajib diisi."}); return }
  if !(role == "admin" || role == "wali_kelas" || role == "guru") { respond(w, 400, map[string]any{"success": false, "message": "Role tidak valid. Role yang bisa dibuat: admin, wali_kelas, guru."}); return }
  exists, _ := a.one(r.Context(), "SELECT id FROM users WHERE email=$1 OR ($2::text IS NOT NULL AND nip=$2) LIMIT 1", email, nip)
  if exists != nil { respond(w, 400, map[string]any{"success": false, "message": "Email atau NIP sudah terdaftar."}); return }
  hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
  row, err := a.one(r.Context(), "INSERT INTO users (email,password,nama,nip,role,telepon,alamat) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,email,nama,nip,role", email, string(hash), nama, nip, role, nullIfEmpty(body["telepon"]), nullIfEmpty(body["alamat"]))
  if err != nil { serverErr(w, err); return }
  respond(w, 201, map[string]any{"success": true, "message": "User berhasil didaftarkan.", "data": row})
}

func (a *App) me(w http.ResponseWriter, r *http.Request) {
  u := currentUser(r)
  row, err := a.one(r.Context(), "SELECT id,email,nama,nip,role,status,foto,telepon,alamat,tanggal_lahir AS \"tanggalLahir\",tempat_lahir AS \"tempatLahir\",tanggal_bergabung AS \"tanggalBergabung\",terakhir_login AS \"terakhirLogin\",created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM users WHERE id=$1", u.ID)
  if err != nil { serverErr(w, err); return }
  if row == nil { respond(w, 404, map[string]any{"success": false, "message": "User tidak ditemukan."}); return }
  respond(w, 200, map[string]any{"success": true, "data": row})
}
func (a *App) updateMe(w http.ResponseWriter, r *http.Request) {
  u := currentUser(r)
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  _, err = a.db.Exec(r.Context(), "UPDATE users SET nama=COALESCE(NULLIF($1,''),nama), email=COALESCE(NULLIF($2,''),email), telepon=COALESCE(NULLIF($3,''),telepon), alamat=COALESCE(NULLIF($4,''),alamat), foto=COALESCE(NULLIF($5,''),foto), updated_at=NOW() WHERE id=$6", toStr(body["nama"]), toStr(body["email"]), toStr(body["telepon"]), toStr(body["alamat"]), toStr(body["foto"]), u.ID)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": "Profil berhasil diperbarui."})
}

func (a *App) changePassword(w http.ResponseWriter, r *http.Request) {
  u := currentUser(r)
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  currentPass := toStr(body["currentPassword"])
  newPass := toStr(body["newPassword"])
  if currentPass == "" || newPass == "" { respond(w, 400, map[string]any{"success": false, "message": "Password saat ini dan password baru wajib diisi."}); return }
  row, err := a.one(r.Context(), "SELECT password FROM users WHERE id=$1", u.ID)
  if err != nil || row == nil { serverErr(w, err); return }
  if bcrypt.CompareHashAndPassword([]byte(toStr(row["password"])), []byte(currentPass)) != nil { respond(w, 400, map[string]any{"success": false, "message": "Password saat ini salah."}); return }
  hash, _ := bcrypt.GenerateFromPassword([]byte(newPass), 10)
  _, err = a.db.Exec(r.Context(), "UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2", string(hash), u.ID)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": "Password berhasil diubah."})
}

func (a *App) usersRoutes() chi.Router {
  r := chi.NewRouter()
  r.With(a.authorizeHierarchy("admin")).Get("/", a.listUsers)
  r.With(a.authorizeHierarchy("admin")).Get("/action/export", a.exportUsers)
  r.With(a.authorize("superadmin")).Post("/action/import", a.importUsers)
  r.With(a.authorizeHierarchy("admin")).Get("/action/template", a.downloadUserTemplate)
  r.With(a.authorizeHierarchy("admin")).Get("/{id}", a.getUser)
  r.With(a.authorizeHierarchy("admin")).Post("/", a.createUser)
  r.With(a.authorizeHierarchy("admin")).Put("/{id}", a.updateUser)
  r.With(a.authorizeHierarchy("admin")).Delete("/{id}", a.deleteUser)
  r.With(a.authorizeHierarchy("admin")).Put("/{id}/reset-password", a.resetPassword)
  return r
}

func (a *App) exportUsers(w http.ResponseWriter, r *http.Request) {
  rows, err := a.many(r.Context(), "SELECT id,email,nama,nip,role,status,telepon,alamat FROM users ORDER BY created_at DESC")
  if err != nil { serverErr(w, err); return }

  data := make([]map[string]any, len(rows))
  for i, row := range rows {
    data[i] = map[string]any{
      "id":      toStr(row["id"]),
      "email":   toStr(row["email"]),
      "nama":    toStr(row["nama"]),
      "nip":     toStr(row["nip"]),
      "role":    toStr(row["role"]),
      "status":  toStr(row["status"]),
      "telepon": toStr(row["telepon"]),
      "alamat":  toStr(row["alamat"]),
    }
  }

  w.Header().Set("Content-Type", "application/json")
  w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=users_export_%s.json", time.Now().Format("2006-01-02")))
  json.NewEncoder(w).Encode(map[string]any{"success": true, "data": data})
}

func (a *App) downloadUserTemplate(w http.ResponseWriter, r *http.Request) {
  format := r.URL.Query().Get("format")
  if format == "" { format = "csv" }

  if format == "xlsx" {
    f := excelize.NewFile()
    f.SetSheetName("Sheet1", "Users")

    headerStyle, _ := f.NewStyle(&excelize.Style{
      Font:      &excelize.Font{Bold: true, Size: 11, Color: "FFFFFF"},
      Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4F46E5"}, Pattern: 1},
      Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
    })

    headers := []string{"Email", "Password", "Nama", "NIP", "Role", "Telepon", "Alamat"}
    for i, h := range headers {
      cell, _ := excelize.CoordinatesToCellName(i+1, 1)
      f.SetCellValue("Users", cell, h)
      f.SetCellStyle("Users", cell, cell, headerStyle)
    }

    samples := [][]interface{}{
      {"guru1@school.id", "password123", "Guru Satu, S.Pd", "199001012020011001", "guru", "08123456789", "Jl. Sekolah No. 1"},
      {"admin2@school.id", "password123", "Admin Dua", "199101012021011002", "admin", "08123456790", "Jl. Sekolah No. 2"},
    }

    for i, sample := range samples {
      row := i + 2
      for j, val := range sample {
        cell, _ := excelize.CoordinatesToCellName(j+1, row)
        f.SetCellValue("Users", cell, val)
      }
    }

    colWidths := []float64{25, 15, 25, 20, 12, 15, 30}
    for i, w := range colWidths {
      colName := string(rune('A' + i))
      f.SetColWidth("Users", colName, colName, w)
    }

    var buf bytes.Buffer
    if err := f.Write(&buf); err != nil {
      serverErr(w, err)
      return
    }

    w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    w.Header().Set("Content-Disposition", "attachment; filename=template_users.xlsx")
    w.Write(buf.Bytes())
  } else {
    w.Header().Set("Content-Type", "text/csv")
    w.Header().Set("Content-Disposition", "attachment; filename=template_users.csv")
    template := `email,password,nama,nip,role,telepon,alamat
guru1@school.id,password123,"Guru Satu, S.Pd",199001012020011001,guru,08123456789,Jl. Sekolah No. 1
admin2@school.id,password123,Admin Dua,199101012021011002,admin,08123456790,Jl. Sekolah No. 2
`
    w.Write([]byte(template))
  }
}

func (a *App) importUsers(w http.ResponseWriter, r *http.Request) {
  err := r.ParseMultipartForm(10 << 20)
  if err != nil {
    respond(w, 400, map[string]any{"success": false, "message": "File terlalu besar (max 10MB)"})
    return
  }

  file, _, err := r.FormFile("file")
  if err != nil {
    respond(w, 400, map[string]any{"success": false, "message": "File tidak ditemukan"})
    return
  }
  defer file.Close()

  content, err := io.ReadAll(file)
  if err != nil { serverErr(w, err); return }

  var data []map[string]any
  _, fileHeader, _ := r.FormFile("file")
  isXlsx := strings.HasSuffix(strings.ToLower(fileHeader.Filename), ".xlsx")

  if isXlsx {
    f, err := excelize.OpenReader(bytes.NewReader(content))
    if err != nil {
      respond(w, 400, map[string]any{"success": false, "message": "File Excel tidak valid: " + err.Error()})
      return
    }
    defer f.Close()

    rows, err := f.GetRows("Users")
    if err != nil {
      respond(w, 400, map[string]any{"success": false, "message": "Sheet 'Users' tidak ditemukan"})
      return
    }

    if len(rows) < 2 {
      respond(w, 400, map[string]any{"success": false, "message": "Tidak ada data untuk diimport"})
      return
    }

    headers := rows[0]
    for i := 1; i < len(rows); i++ {
      row := rows[i]
      item := make(map[string]any)
      for j, h := range headers {
        if j < len(row) {
          item[strings.ToLower(h)] = row[j]
        }
      }
      if email, ok := item["email"].(string); ok && email != "" {
        data = append(data, item)
      }
    }
  } else {
    // CSV
    lines := strings.Split(string(content), "\n")
    var headers []string
    for i, line := range lines {
      line = strings.TrimSpace(line)
      if line == "" || strings.HasPrefix(line, "#") { continue }
      if i == 0 {
        headers = strings.Split(line, ",")
        for j := range headers { headers[j] = strings.TrimSpace(headers[j]) }
        continue
      }
      values := strings.Split(line, ",")
      if len(values) < 3 { continue }
      row := make(map[string]any)
      for j, h := range headers {
        if j < len(values) {
          row[h] = strings.TrimSpace(values[j])
        }
      }
      if email, ok := row["email"].(string); ok && email != "" {
        data = append(data, row)
      }
    }
  }

  if len(data) == 0 {
    respond(w, 400, map[string]any{"success": false, "message": "Tidak ada data untuk diimport"})
    return
  }

  imported := 0
  for _, item := range data {
    email := strings.TrimSpace(toStr(item["email"]))
    if email == "" { continue }

    password := toStr(item["password"])
    nama := toStr(item["nama"])
    nip := toStr(item["nip"])
    role := toStr(item["role"])
    if role == "" { role = "guru" }
    telepon := toStr(item["telepon"])
    alamat := toStr(item["alamat"])

    var id string
    err := a.db.QueryRow(r.Context(), "SELECT id FROM users WHERE email=$1", email).Scan(&id)
    if err == nil {
      // Update
      _, err = a.db.Exec(r.Context(),
        "UPDATE users SET nama=COALESCE(NULLIF($1,''),nama), nip=COALESCE(NULLIF($2,''),nip), role=COALESCE(NULLIF($3,''),role), telepon=COALESCE(NULLIF($4,''),telepon), alamat=COALESCE(NULLIF($5,''),alamat), updated_at=NOW() WHERE id=$6",
        nama, nip, role, telepon, alamat, id)
    } else {
      // Insert
      if password == "" { password = "password123" }
      hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
      _, err = a.db.Exec(r.Context(),
        "INSERT INTO users (email, password, nama, nip, role, telepon, alamat) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        email, string(hash), nama, nip, role, telepon, alamat)
    }
    if err == nil { imported++ }
  }

  respond(w, 200, map[string]any{"success": true, "message": fmt.Sprintf("Berhasil import %d user", imported), "data": map[string]int{"imported": imported}})
}

func (a *App) listUsers(w http.ResponseWriter, r *http.Request) {
  rows, err := a.many(r.Context(), "SELECT id,email,nama,nip,role,status,foto,telepon,alamat,tanggal_lahir AS \"tanggalLahir\",tempat_lahir AS \"tempatLahir\",tanggal_bergabung AS \"tanggalBergabung\",terakhir_login AS \"terakhirLogin\",created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM users ORDER BY created_at DESC")
  if err != nil { serverErr(w, err); return }
  role := r.URL.Query().Get("role")
  status := r.URL.Query().Get("status")
  search := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("search")))
  out := make([]map[string]any, 0, len(rows))
  for _, u := range rows {
    if role != "" && toStr(u["role"]) != role { continue }
    if status != "" && toStr(u["status"]) != status { continue }
    if search != "" {
      if !strings.Contains(strings.ToLower(toStr(u["nama"])), search) && !strings.Contains(strings.ToLower(toStr(u["email"])), search) && !strings.Contains(strings.ToLower(toStr(u["nip"])), search) { continue }
    }
    out = append(out, u)
  }
  respond(w, 200, map[string]any{"success": true, "data": out})
}

func (a *App) getUser(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  row, err := a.one(r.Context(), "SELECT id,email,nama,nip,role,status,foto,telepon,alamat,tanggal_lahir AS \"tanggalLahir\",tempat_lahir AS \"tempatLahir\",tanggal_bergabung AS \"tanggalBergabung\",terakhir_login AS \"terakhirLogin\",created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM users WHERE id=$1", id)
  if err != nil { serverErr(w, err); return }
  if row == nil { respond(w, 404, map[string]any{"success": false, "message": "User tidak ditemukan."}); return }
  respond(w, 200, map[string]any{"success": true, "data": row})
}

func (a *App) createUser(w http.ResponseWriter, r *http.Request) {
  a.register(w, r)
}

func (a *App) updateUser(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  actor := currentUser(r)
  
  // Ambil data user yang akan diupdate untuk pengecekan
  old, err := a.one(r.Context(), "SELECT id, role, email, nip FROM users WHERE id=$1", id)
  if err != nil || old == nil { respond(w, 404, map[string]any{"success": false, "message": "User tidak ditemukan."}); return }

  if toStr(body["role"]) == "superadmin" && (actor == nil || actor.Role != "superadmin") {
    respond(w, 403, map[string]any{"success": false, "message": "Hanya superadmin yang dapat mengubah role ke superadmin."}); return
  }

  email := strings.TrimSpace(toStr(body["email"]))
  nip := strings.TrimSpace(toStr(body["nip"]))

  // Cek apakah email sudah digunakan oleh user lain
  if email != "" && email != toStr(old["email"]) {
    exists, _ := a.one(r.Context(), "SELECT id FROM users WHERE email=$1 AND id!=$2 LIMIT 1", email, id)
    if exists != nil { respond(w, 400, map[string]any{"success": false, "message": "Email sudah digunakan oleh user lain."}); return }
  }

  // Cek apakah NIP sudah digunakan oleh user lain
  if nip != "" && nip != toStr(old["nip"]) {
    exists, _ := a.one(r.Context(), "SELECT id FROM users WHERE nip=$1 AND id!=$2 LIMIT 1", nip, id)
    if exists != nil { respond(w, 400, map[string]any{"success": false, "message": "NIP sudah digunakan oleh user lain."}); return }
  }

  _, err = a.db.Exec(r.Context(), `
    UPDATE users SET 
      nama=COALESCE(NULLIF($1,''), nama), 
      email=COALESCE(NULLIF($2,''), email), 
      nip=NULLIF($3,''), 
      role=COALESCE(NULLIF($4,''), role), 
      status=COALESCE(NULLIF($5,''), status), 
      telepon=$6, 
      alamat=$7, 
      updated_at=NOW() 
    WHERE id=$8`, 
    toStr(body["nama"]), email, nip, toStr(body["role"]), toStr(body["status"]), toStr(body["telepon"]), toStr(body["alamat"]), id)
  
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": "User berhasil diperbarui."})
}

func (a *App) deleteUser(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  row, _ := a.one(r.Context(), "SELECT id,role FROM users WHERE id=$1", id)
  if row == nil { respond(w, 404, map[string]any{"success": false, "message": "User tidak ditemukan."}); return }
  
  actor := currentUser(r)
  targetRole := toStr(row["role"])
  
  if targetRole == "superadmin" { respond(w, 403, map[string]any{"success": false, "message": "Tidak dapat menghapus user superadmin."}); return }
  if targetRole == "admin" && actor.Role != "superadmin" { respond(w, 403, map[string]any{"success": false, "message": "Hanya superadmin yang dapat menghapus admin lain."}); return }

  _, err := a.db.Exec(r.Context(), "DELETE FROM users WHERE id=$1", id)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": "User berhasil dihapus."})
}

func (a *App) resetPassword(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  newPass := toStr(body["newPassword"])
  if newPass == "" { respond(w, 400, map[string]any{"success": false, "message": "Password baru wajib diisi."}); return }
  hash, _ := bcrypt.GenerateFromPassword([]byte(newPass), 10)
  _, err = a.db.Exec(r.Context(), "UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2", string(hash), id)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": "Password berhasil direset."})
}

func (a *App) sekolahRoutes() chi.Router {
  r := chi.NewRouter()
  r.Get("/sekolah", func(w http.ResponseWriter, r *http.Request) { a.simpleLatest(w, r, "data_sekolah") })
  r.With(a.authorizeHierarchy("admin")).Post("/sekolah", func(w http.ResponseWriter, r *http.Request) { a.simpleUpsertSingle(w, r, "data_sekolah", "Data sekolah berhasil disimpan.") })
  r.Get("/informasi", func(w http.ResponseWriter, r *http.Request) { a.simpleLatest(w, r, "informasi_umum") })
  r.With(a.authorizeHierarchy("admin")).Post("/informasi", func(w http.ResponseWriter, r *http.Request) { a.simpleUpsertSingle(w, r, "informasi_umum", "Informasi umum berhasil disimpan.") })
  return r
}

func (a *App) siswaRoutes() chi.Router {
  r := chi.NewRouter()
  r.With(a.authorizeHierarchy("guru")).Get("/", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "data_siswa", map[string]string{"kelas": "kelas", "status": "status"}) })
  r.With(a.authorizeHierarchy("guru")).Get("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleGetByID(w, r, "data_siswa", "Siswa tidak ditemukan.") })
  r.With(a.authorizeHierarchy("admin")).Post("/", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "data_siswa", "Siswa berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "data_siswa", "Data siswa berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("admin")).Delete("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "data_siswa", "Siswa berhasil dihapus.") })
  r.With(a.authorizeHierarchy("admin")).Post("/bulk", a.bulkSiswa)
  return r
}

func (a *App) mapelRoutes() chi.Router {
  r := chi.NewRouter()
  r.With(a.authorizeHierarchy("guru")).Get("/", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "mata_pelajaran", map[string]string{"fase": "fase", "kelompok": "kelompok"}) })
  r.With(a.authorizeHierarchy("guru")).Get("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleGetByID(w, r, "mata_pelajaran", "Mata pelajaran tidak ditemukan.") })
  r.With(a.authorizeHierarchy("admin")).Post("/", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "mata_pelajaran", "Mata pelajaran berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("admin")).Put("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "mata_pelajaran", "Mata pelajaran berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("admin")).Delete("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "mata_pelajaran", "Mata pelajaran berhasil dihapus.") })
  r.With(a.authorizeHierarchy("guru")).Get("/export", a.exportMapel)
  r.With(a.authorizeHierarchy("admin")).Post("/import", a.importMapel)
  r.With(a.authorizeHierarchy("guru")).Get("/template", a.downloadMapelTemplate)
  r.With(a.authorizeHierarchy("guru")).Get("/tujuan-pembelajaran", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "tujuan_pembelajaran", map[string]string{"mataPelajaranId": "mata_pelajaran_id", "fase": "fase"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/tujuan-pembelajaran", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "tujuan_pembelajaran", "Tujuan pembelajaran berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/tujuan-pembelajaran/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "tujuan_pembelajaran", "Tujuan pembelajaran berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("guru")).Delete("/tujuan-pembelajaran/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "tujuan_pembelajaran", "Tujuan pembelajaran berhasil dihapus.") })
  r.With(a.authorizeHierarchy("guru")).Get("/lingkup-materi", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "lingkup_materi", map[string]string{"mataPelajaranId": "mata_pelajaran_id"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/lingkup-materi", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "lingkup_materi", "Lingkup materi berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/lingkup-materi/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "lingkup_materi", "Lingkup materi berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("guru")).Delete("/lingkup-materi/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "lingkup_materi", "Lingkup materi berhasil dihapus.") })
  return r
}

func (a *App) ekstraRoutes() chi.Router {
  r := chi.NewRouter()
  r.With(a.authorizeHierarchy("guru")).Get("/", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "ekstrakurikuler", map[string]string{"jenis": "jenis"}) })
  r.With(a.authorizeHierarchy("guru")).Get("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleGetByID(w, r, "ekstrakurikuler", "Ekstrakurikuler tidak ditemukan.") })
  r.With(a.authorizeHierarchy("admin")).Post("/", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "ekstrakurikuler", "Ekstrakurikuler berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("admin")).Put("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "ekstrakurikuler", "Ekstrakurikuler berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("admin")).Delete("/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "ekstrakurikuler", "Ekstrakurikuler berhasil dihapus.") })
  r.With(a.authorizeHierarchy("guru")).Get("/penilaian/nilai", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "penilaian_ekstrakurikuler", map[string]string{"siswaId": "siswa_id", "ekstrakurikulerId": "ekstrakurikuler_id", "semester": "semester", "tahunAjaran": "tahun_ajaran"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/penilaian/nilai", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "penilaian_ekstrakurikuler", "Penilaian ekstrakurikuler berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/penilaian/nilai/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "penilaian_ekstrakurikuler", "Penilaian berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("guru")).Delete("/penilaian/nilai/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "penilaian_ekstrakurikuler", "Penilaian berhasil dihapus.") })
  return r
}

func (a *App) penilaianRoutes() chi.Router {
  r := chi.NewRouter()
  r.With(a.authorizeHierarchy("guru")).Get("/formatif", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "asesmen_formatif", map[string]string{"mataPelajaranId": "mata_pelajaran_id", "siswaId": "siswa_id"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/formatif", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "asesmen_formatif", "Asesmen formatif berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/formatif/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "asesmen_formatif", "Asesmen formatif berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("guru")).Delete("/formatif/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "asesmen_formatif", "Asesmen formatif berhasil dihapus.") })
  r.With(a.authorizeHierarchy("guru")).Get("/sumatif", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "asesmen_sumatif", map[string]string{"mataPelajaranId": "mata_pelajaran_id", "siswaId": "siswa_id", "jenis": "jenis"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/sumatif", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "asesmen_sumatif", "Asesmen sumatif berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("guru")).Put("/sumatif/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "asesmen_sumatif", "Asesmen sumatif berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("guru")).Delete("/sumatif/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "asesmen_sumatif", "Asesmen sumatif berhasil dihapus.") })
  r.With(a.authorizeHierarchy("guru")).Get("/nilai-akhir", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "nilai_akhir", map[string]string{"siswaId": "siswa_id", "mataPelajaranId": "mata_pelajaran_id", "semester": "semester", "tahunAjaran": "tahun_ajaran"}) })
  r.With(a.authorizeHierarchy("guru")).Post("/nilai-akhir/calculate", a.calculateNilaiAkhir)
  r.With(a.authorizeHierarchy("admin")).Delete("/nilai-akhir/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "nilai_akhir", "Nilai akhir berhasil dihapus.") })
  r.With(a.authorizeHierarchy("admin")).Get("/mutasi", func(w http.ResponseWriter, r *http.Request) { a.simpleList(w, r, "mutasi", map[string]string{"jenis": "jenis", "siswaId": "siswa_id"}) })
  r.With(a.authorizeHierarchy("admin")).Post("/mutasi", func(w http.ResponseWriter, r *http.Request) { a.simpleCreate(w, r, "mutasi", "Mutasi berhasil ditambahkan.") })
  r.With(a.authorizeHierarchy("admin")).Put("/mutasi/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleUpdate(w, r, "mutasi", "Mutasi berhasil diperbarui.") })
  r.With(a.authorizeHierarchy("admin")).Delete("/mutasi/{id}", func(w http.ResponseWriter, r *http.Request) { a.simpleDelete(w, r, "mutasi", "Mutasi berhasil dihapus.") })
  return r
}
func (a *App) calculateNilaiAkhir(w http.ResponseWriter, r *http.Request) {
  body, _ := readBody(r)
  semester := toStr(body["semester"])
  if semester == "" { semester = "1" }
  tahunAjaran := toStr(body["tahunAjaran"])
  if tahunAjaran == "" {
    y := time.Now().Year()
    tahunAjaran = fmt.Sprintf("%d/%d", y, y+1)
  }
  students, err := a.many(r.Context(), "SELECT id,nama,nisn FROM data_siswa")
  if err != nil { serverErr(w, err); return }
  subjects, err := a.many(r.Context(), "SELECT id,nama FROM mata_pelajaran")
  if err != nil { serverErr(w, err); return }

  results := make([]map[string]any, 0)
  for _, s := range students {
    for _, m := range subjects {
      var f, su float64
      _ = a.db.QueryRow(r.Context(), "SELECT COALESCE(AVG(nilai::numeric),0) FROM asesmen_formatif WHERE mata_pelajaran_id=$1 AND siswa_id=$2", s["id"], m["id"]).Scan(&f)
      _ = a.db.QueryRow(r.Context(), "SELECT COALESCE(AVG(nilai::numeric),0) FROM asesmen_sumatif WHERE mata_pelajaran_id=$1 AND siswa_id=$2", s["id"], m["id"]).Scan(&su)
      final := int(math.Round((f * 0.3) + (su * 0.7)))
      if final <= 0 { continue }
      pred, desk := predikat(final)
      row := map[string]any{"mataPelajaranId": s2n(m["id"]), "mataPelajaran": m["nama"], "siswaId": s2n(s["id"]), "siswa": s["nama"], "nisn": s["nisn"], "nilaiFormatif": strconv.Itoa(int(math.Round(f))), "nilaiSumatif": strconv.Itoa(int(math.Round(su))), "nilaiAkhir": strconv.Itoa(final), "predikat": pred, "deskripsi": desk, "tahunAjaran": tahunAjaran, "semester": semester}
      results = append(results, row)
      _, _ = a.db.Exec(r.Context(), "INSERT INTO nilai_akhir (mata_pelajaran_id,mata_pelajaran,siswa_id,siswa,nisn,nilai_formatif,nilai_sumatif,nilai_akhir,predikat,deskripsi,tahun_ajaran,semester) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", row["mataPelajaranId"], row["mataPelajaran"], row["siswaId"], row["siswa"], row["nisn"], row["nilaiFormatif"], row["nilaiSumatif"], row["nilaiAkhir"], row["predikat"], row["deskripsi"], row["tahunAjaran"], row["semester"])
    }
  }

  respond(w, 200, map[string]any{"success": true, "message": fmt.Sprintf("Berhasil menghitung %d nilai akhir.", len(results)), "data": map[string]any{"count": len(results), "nilai": results}})
}

func (a *App) bulkSiswa(w http.ResponseWriter, r *http.Request) {
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  items, ok := body["students"].([]any)
  if !ok || len(items) == 0 { respond(w, 400, map[string]any{"success": false, "message": "Data siswa harus berupa array dan tidak boleh kosong."}); return }
  inserted := 0
  errs := []map[string]any{}
  for _, raw := range items {
    m, ok := raw.(map[string]any)
    if !ok { continue }
    nisn := toStr(m["nisn"])
    if nisn == "" { errs = append(errs, map[string]any{"error": "NISN kosong"}); continue }
    ex, _ := a.one(r.Context(), "SELECT id FROM data_siswa WHERE nisn=$1", nisn)
    if ex != nil { errs = append(errs, map[string]any{"nisn": nisn, "nama": m["nama"], "error": "NISN sudah terdaftar"}); continue }
    _, err := a.db.Exec(r.Context(), "INSERT INTO data_siswa (nis,nisn,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,agama,alamat,nama_ortu,telepon_ortu,tanggal_masuk,kelas,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)", nullIfEmpty(m["nis"]), nisn, toStr(m["nama"]), nullIfEmpty(m["tempatLahir"]), nullIfEmpty(m["tanggalLahir"]), coalesceVal(toStr(m["jenisKelamin"]), "L"), nullIfEmpty(m["agama"]), nullIfEmpty(m["alamat"]), toStr(m["namaOrtu"]), nullIfEmpty(m["teleponOrtu"]), nullIfEmpty(m["tanggalMasuk"]), nullIfEmpty(m["kelas"]), coalesceVal(toStr(m["status"]), "Aktif"))
    if err != nil { errs = append(errs, map[string]any{"nisn": nisn, "nama": m["nama"], "error": err.Error()}); continue }
    inserted++
  }
  data := map[string]any{"inserted": inserted}
  if len(errs) > 0 { data["errors"] = errs }
  respond(w, 200, map[string]any{"success": true, "message": fmt.Sprintf("Berhasil mengimport %d siswa.", inserted), "data": data})
}

func (a *App) simpleLatest(w http.ResponseWriter, r *http.Request, table string) {
  row, err := a.one(r.Context(), fmt.Sprintf("SELECT * FROM %s ORDER BY created_at DESC LIMIT 1", table))
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "data": row})
}

func (a *App) simpleUpsertSingle(w http.ResponseWriter, r *http.Request, table, msg string) {
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  existing, err := a.one(r.Context(), fmt.Sprintf("SELECT id FROM %s LIMIT 1", table))
  if err != nil { serverErr(w, err); return }
  if existing == nil {
    row, err := a.insertFromMap(r.Context(), table, body)
    if err != nil { serverErr(w, err); return }
    respond(w, 200, map[string]any{"success": true, "message": msg, "data": row})
    return
  }
  row, err := a.updateFromMap(r.Context(), table, toStr(existing["id"]), body)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": msg, "data": row})
}

func (a *App) simpleList(w http.ResponseWriter, r *http.Request, table string, filters map[string]string) {
  cond := []string{}
  args := []any{}
  idx := 1
  for q, col := range filters {
    v := strings.TrimSpace(r.URL.Query().Get(q))
    if v == "" { continue }
    cond = append(cond, fmt.Sprintf("%s = $%d", col, idx))
    args = append(args, v)
    idx++
  }
  sql := fmt.Sprintf("SELECT * FROM %s", table)
  if len(cond) > 0 { sql += " WHERE " + strings.Join(cond, " AND ") }
  sql += " ORDER BY created_at DESC"
  rows, err := a.many(r.Context(), sql, args...)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "data": rows})
}

func (a *App) simpleGetByID(w http.ResponseWriter, r *http.Request, table, notFoundMsg string) {
  id := chi.URLParam(r, "id")
  row, err := a.one(r.Context(), fmt.Sprintf("SELECT * FROM %s WHERE id=$1", table), id)
  if err != nil { serverErr(w, err); return }
  if row == nil { respond(w, 404, map[string]any{"success": false, "message": notFoundMsg}); return }
  respond(w, 200, map[string]any{"success": true, "data": row})
}

func (a *App) simpleCreate(w http.ResponseWriter, r *http.Request, table, message string) {
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  row, err := a.insertFromMap(r.Context(), table, body)
  if err != nil { serverErr(w, err); return }
  respond(w, 201, map[string]any{"success": true, "message": message, "data": row})
}

func (a *App) simpleUpdate(w http.ResponseWriter, r *http.Request, table, message string) {
  id := chi.URLParam(r, "id")
  body, err := readBody(r)
  if err != nil { respond(w, 400, map[string]any{"success": false, "message": "Invalid payload"}); return }
  _, err = a.one(r.Context(), fmt.Sprintf("SELECT id FROM %s WHERE id=$1", table), id)
  if err != nil { serverErr(w, err); return }
  _, err = a.updateFromMap(r.Context(), table, id, body)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": message})
}

func (a *App) simpleDelete(w http.ResponseWriter, r *http.Request, table, message string) {
  id := chi.URLParam(r, "id")
  _, err := a.db.Exec(r.Context(), fmt.Sprintf("DELETE FROM %s WHERE id=$1", table), id)
  if err != nil { serverErr(w, err); return }
  respond(w, 200, map[string]any{"success": true, "message": message})
}

func (a *App) insertFromMap(ctx context.Context, table string, body map[string]any) (map[string]any, error) {
  cols := []string{}
  vals := []any{}
  ph := []string{}
  i := 1
  for k, v := range body {
    col := camelToSnake(k)
    if col == "id" || col == "created_at" || col == "updated_at" { continue }
    cols = append(cols, col)
    vals = append(vals, emptyToNil(v))
    ph = append(ph, fmt.Sprintf("$%d", i))
    i++
  }
  if len(cols) == 0 {
    return nil, errors.New("no fields to insert")
  }
  sql := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING *", table, strings.Join(cols, ","), strings.Join(ph, ","))
  return a.one(ctx, sql, vals...)
}

func (a *App) updateFromMap(ctx context.Context, table, id string, body map[string]any) (map[string]any, error) {
  sets := []string{}
  vals := []any{}
  i := 1
  for k, v := range body {
    col := camelToSnake(k)
    if col == "id" || col == "created_at" || col == "updated_at" { continue }
    sets = append(sets, fmt.Sprintf("%s = COALESCE(NULLIF($%d::text,''), %s::text)", col, i, col))
    vals = append(vals, toStr(v))
    i++
  }
  sets = append(sets, "updated_at = NOW()")
  vals = append(vals, id)
  sql := fmt.Sprintf("UPDATE %s SET %s WHERE id=$%d RETURNING *", table, strings.Join(sets, ","), i)
  return a.one(ctx, sql, vals...)
}

func (a *App) many(ctx context.Context, q string, args ...any) ([]map[string]any, error) {
  wrap := fmt.Sprintf("SELECT COALESCE(json_agg(t), '[]'::json)::text FROM (%s) t", q)
  var raw string
  if err := a.db.QueryRow(ctx, wrap, args...).Scan(&raw); err != nil { return nil, err }
  out := []map[string]any{}
  if err := json.Unmarshal([]byte(raw), &out); err != nil { return nil, err }
  return out, nil
}

func (a *App) one(ctx context.Context, q string, args ...any) (map[string]any, error) {
  rows, err := a.db.Query(ctx, q, args...)
  if err != nil { return nil, err }
  defer rows.Close()

  if !rows.Next() {
    return nil, rows.Err()
  }

  values, err := rows.Values()
  if err != nil { return nil, err }

  fields := rows.FieldDescriptions()
  out := make(map[string]any, len(fields))
  for i, field := range fields {
    out[string(field.Name)] = normalizeDBValue(values[i])
  }
  return out, rows.Err()
}

func readBody(r *http.Request) (map[string]any, error) {
  defer r.Body.Close()
  out := map[string]any{}
  dec := json.NewDecoder(r.Body)
  if err := dec.Decode(&out); err != nil {
    if strings.Contains(err.Error(), "EOF") { return out, nil }
    return nil, err
  }
  return out, nil
}

func respond(w http.ResponseWriter, code int, data any) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(code)
  _ = json.NewEncoder(w).Encode(data)
}

func serverErr(w http.ResponseWriter, err error) {
  respond(w, 500, map[string]any{"success": false, "message": "Terjadi kesalahan pada server.", "error": err.Error()})
}

func toStr(v any) string {
  if v == nil { return "" }
  switch t := v.(type) {
  case string: return t
  case float64: return strconv.FormatFloat(t, 'f', -1, 64)
  case bool: if t { return "true" }; return "false"
  default: return fmt.Sprintf("%v", v)
  }
}

func normalizeDBValue(v any) any {
  switch t := v.(type) {
  case []byte:
    return string(t)
  default:
    return v
  }
}

func camelToSnake(in string) string {
  out := strings.Builder{}
  for i, r := range in {
    if r >= 'A' && r <= 'Z' {
      if i > 0 { out.WriteByte('_') }
      out.WriteRune(r + 32)
    } else {
      out.WriteRune(r)
    }
  }
  return out.String()
}

func nullIfEmpty(v any) any {
  s := strings.TrimSpace(toStr(v))
  if s == "" { return nil }
  return s
}

func emptyToNil(v any) any {
  if strings.TrimSpace(toStr(v)) == "" { return nil }
  return v
}

func coalesceVal(v, fallback string) string {
  if strings.TrimSpace(v) == "" { return fallback }
  return v
}

func s2n(v any) any {
  return nullIfEmpty(v)
}

func predikat(n int) (string, string) {
  if n >= 90 { return "A", "Sangat Baik" }
  if n >= 80 { return "B", "Baik" }
  if n >= 70 { return "C", "Cukup" }
  if n >= 60 { return "D", "Kurang" }
  return "E", "Sangat Kurang"
}

// Export Mapel functions
func (a *App) exportMapel(w http.ResponseWriter, r *http.Request) {
  format := r.URL.Query().Get("format")
  if format == "" { format = "json" }

  rows, err := a.many(r.Context(), "SELECT id,kode,nama,kelompok,fase,jp_per_minggu,guru,keterangan FROM mata_pelajaran ORDER BY kode")
  if err != nil { serverErr(w, err); return }

  // Transform data for frontend
  data := make([]map[string]any, len(rows))
  for i, row := range rows {
    data[i] = map[string]any{
      "id":           toStr(row["id"]),
      "kode":         toStr(row["kode"]),
      "nama":         toStr(row["nama"]),
      "kelompok":     toStr(row["kelompok"]),
      "fase":         toStr(row["fase"]),
      "jpPerMinggu":  toStr(row["jp_per_minggu"]),
      "guru":         toStr(row["guru"]),
      "keterangan":   toStr(row["keterangan"]),
    }
  }

  w.Header().Set("Content-Type", "application/json")
  w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=mata_pelajaran_export_%s.json", time.Now().Format("2006-01-02")))
  json.NewEncoder(w).Encode(map[string]any{"success": true, "data": data})
}

func (a *App) downloadMapelTemplate(w http.ResponseWriter, r *http.Request) {
  format := r.URL.Query().Get("format")
  if format == "" { format = "csv" }

  if format == "xlsx" {
    // Generate XLSX dynamically
    f := excelize.NewFile()
    f.SetSheetName("Sheet1", "Mata Pelajaran")

    headerStyle, _ := f.NewStyle(&excelize.Style{
      Font:      &excelize.Font{Bold: true, Size: 11, Color: "FFFFFF"},
      Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4F46E5"}, Pattern: 1},
      Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
    })

    headers := []string{"ID", "Kode", "Nama", "Kelompok", "Fase", "JP Per Minggu", "Guru", "Keterangan"}
    for i, h := range headers {
      cell, _ := excelize.CoordinatesToCellName(i+1, 1)
      f.SetCellValue("Mata Pelajaran", cell, h)
      f.SetCellStyle("Mata Pelajaran", cell, cell, headerStyle)
    }

    samples := [][]interface{}{
      {"", "MAP-001", "Matematika", "A", "Fase D", "6 JP", "Budi Santoso", "Mata pelajaran wajib"},
      {"", "MAP-002", "Bahasa Indonesia", "A", "Fase D", "4 JP", "Siti Aminah", "Mata pelajaran wajib"},
      {"", "MAP-003", "Bahasa Inggris", "A", "Fase D", "4 JP", "John Smith", "Mata pelajaran wajib"},
    }

    for i, sample := range samples {
      row := i + 2
      for j, val := range sample {
        cell, _ := excelize.CoordinatesToCellName(j+1, row)
        f.SetCellValue("Mata Pelajaran", cell, val)
      }
    }

    colWidths := []float64{10, 12, 30, 12, 12, 15, 25, 30}
    for i, w := range colWidths {
      colName := string(rune('A' + i))
      f.SetColWidth("Mata Pelajaran", colName, colName, w)
    }

    var buf bytes.Buffer
    if err := f.Write(&buf); err != nil {
      serverErr(w, err)
      return
    }

    w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    w.Header().Set("Content-Disposition", "attachment; filename=template_mata_pelajaran.xlsx")
    w.Write(buf.Bytes())
  } else if format == "csv" {
    w.Header().Set("Content-Type", "text/csv")
    w.Header().Set("Content-Disposition", "attachment; filename=template_mata_pelajaran.csv")
    template := `id,kode,nama,kelompok,fase,jp_per_minggu,guru,keterangan
,MAP-001,Matematika,A,Fase D,6 JP,Budi Santoso,Mata pelajaran wajib
,MAP-002,Bahasa Indonesia,A,Fase D,4 JP,Siti Aminah,Mata pelajaran wajib
,MAP-003,Bahasa Inggris,A,Fase D,4 JP,John Smith,Mata pelajaran wajib
`
    w.Write([]byte(template))
  } else {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Content-Disposition", "attachment; filename=template_mata_pelajaran.json")
    template := map[string]any{
      "data": []map[string]any{
        {"id": "", "kode": "MAP-001", "nama": "Matematika", "kelompok": "A", "fase": "Fase D", "jpPerMinggu": "6 JP", "guru": "Budi Santoso", "keterangan": "Mata pelajaran wajib"},
        {"id": "", "kode": "MAP-002", "nama": "Bahasa Indonesia", "kelompok": "A", "fase": "Fase D", "jpPerMinggu": "4 JP", "guru": "Siti Aminah", "keterangan": "Mata pelajaran wajib"},
      },
    }
    json.NewEncoder(w).Encode(template)
  }
}

func (a *App) importMapel(w http.ResponseWriter, r *http.Request) {
  err := r.ParseMultipartForm(10 << 20) // 10 MB
  if err != nil {
    respond(w, 400, map[string]any{"success": false, "message": "File terlalu besar (max 10MB)"})
    return
  }

  file, _, err := r.FormFile("file")
  if err != nil {
    respond(w, 400, map[string]any{"success": false, "message": "File tidak ditemukan"})
    return
  }
  defer file.Close()

  content, err := io.ReadAll(file)
  if err != nil {
    serverErr(w, err)
    return
  }

  var data []map[string]any

  // Get filename
  _, fileHeader, _ := r.FormFile("file")
  isXlsx := strings.HasSuffix(strings.ToLower(fileHeader.Filename), ".xlsx")

  // Check if XLSX
  if isXlsx {
    f, err := excelize.OpenReader(bytes.NewReader(content))
    if err != nil {
      respond(w, 400, map[string]any{"success": false, "message": "File Excel tidak valid: " + err.Error()})
      return
    }
    defer f.Close()

    rows, err := f.GetRows("Mata Pelajaran")
    if err != nil {
      respond(w, 400, map[string]any{"success": false, "message": "Sheet 'Mata Pelajaran' tidak ditemukan"})
      return
    }

    if len(rows) < 2 {
      respond(w, 400, map[string]any{"success": false, "message": "Tidak ada data untuk diimport"})
      return
    }

    headers := rows[0]
    for i := 1; i < len(rows); i++ {
      row := rows[i]
      if len(row) < 3 { continue } // Skip invalid rows

      item := make(map[string]any)
      for j, h := range headers {
        if j < len(row) {
          item[strings.ToLower(h)] = row[j]
        }
      }
      if nama, ok := item["nama"].(string); ok && nama != "" {
        data = append(data, item)
      }
    }
  } else if err := json.Unmarshal(content, &data); err != nil {
    // Try parse as CSV
    lines := strings.Split(string(content), "\n")
    var headers []string
    for i, line := range lines {
      line = strings.TrimSpace(line)
      if line == "" || strings.HasPrefix(line, "#") { continue }
      if i == 0 {
        headers = strings.Split(line, ",")
        for j := range headers { headers[j] = strings.TrimSpace(headers[j]) }
        continue
      }
      values := strings.Split(line, ",")
      if len(values) != len(headers) { continue }
      row := make(map[string]any)
      for j, h := range headers {
        row[h] = strings.TrimSpace(values[j])
      }
      if nama, ok := row["nama"].(string); ok && nama != "" {
        data = append(data, row)
      }
    }
  }

  if len(data) == 0 {
    respond(w, 400, map[string]any{"success": false, "message": "Tidak ada data untuk diimport"})
    return
  }

  imported := 0
  for _, item := range data {
    nama := toStr(item["nama"])
    if nama == "" { continue }

    kode := toStr(item["kode"])
    if kode == "" { kode = toStr(item["Kode"]) }
    kelompok := toStr(item["kelompok"])
    if kelompok == "" { kelompok = toStr(item["Kelompok"]) }
    if kelompok == "" { kelompok = "A" }
    fase := toStr(item["fase"])
    if fase == "" { fase = toStr(item["Fase"]) }
    jpPerMinggu := toStr(item["jpPerMinggu"])
    if jpPerMinggu == "" { jpPerMinggu = toStr(item["JP"]) }
    guru := toStr(item["guru"])
    if guru == "" { guru = toStr(item["Guru"]) }
    keterangan := toStr(item["keterangan"])
    if keterangan == "" { keterangan = toStr(item["Keterangan"]) }

    // Check if exists by kode
    var id string
    err := a.db.QueryRow(r.Context(), "SELECT id FROM mata_pelajaran WHERE kode=$1", kode).Scan(&id)
    if err == nil {
      // Update existing
      _, err = a.db.Exec(r.Context(),
        "UPDATE mata_pelajaran SET nama=$1, kelompok=$2, fase=$3, jp_per_minggu=$4, guru=$5, keterangan=$6, updated_at=NOW() WHERE id=$7",
        nama, kelompok, fase, jpPerMinggu, guru, keterangan, id)
    } else {
      // Insert new
      _, err = a.db.Exec(r.Context(),
        "INSERT INTO mata_pelajaran (kode, nama, kelompok, fase, jp_per_minggu, guru, keterangan) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        kode, nama, kelompok, fase, jpPerMinggu, guru, keterangan)
    }
    if err == nil { imported++ }
  }

  respond(w, 200, map[string]any{"success": true, "message": fmt.Sprintf("Berhasil import %d mata pelajaran", imported), "data": map[string]int{"imported": imported}})
}
