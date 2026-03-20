//go:build ignore

package main

import (
	"fmt"
	"log"

	"github.com/xuri/excelize/v2"
)

func main() {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			log.Println(err)
		}
	}()

	// Set sheet name
	f.SetSheetName("Sheet1", "Mata Pelajaran")

	// Header style
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 11, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4F46E5"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	// Normal style
	normalStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Size: 10},
		Alignment: &excelize.Alignment{Vertical: "center"},
	})

	// Headers
	headers := []string{"ID", "Kode", "Nama", "Kelompok", "Fase", "JP Per Minggu", "Guru", "Keterangan"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue("Mata Pelajaran", cell, h)
		f.SetCellStyle("Mata Pelajaran", cell, cell, headerStyle)
	}

	// Sample data
	samples := [][]interface{}{
		{"", "MAP-001", "Matematika", "A", "Fase D", "6 JP", "Budi Santoso", "Mata pelajaran wajib"},
		{"", "MAP-002", "Bahasa Indonesia", "A", "Fase D", "4 JP", "Siti Aminah", "Mata pelajaran wajib"},
		{"", "MAP-003", "Bahasa Inggris", "A", "Fase D", "4 JP", "John Smith", "Mata pelajaran wajib"},
		{"", "MAP-004", "Ilmu Pengetahuan Alam", "A", "Fase D", "4 JP", "Dr. Ahmad", "Mata pelajaran wajib"},
		{"", "MAP-005", "Ilmu Pengetahuan Sosial", "A", "Fase D", "3 JP", "Prof. Maria", "Mata pelajaran wajib"},
		{"", "MAP-006", "Pendidikan Pancasila", "A", "Fase D", "2 JP", "Drs. Hasan", "Mata pelajaran wajib"},
		{"", "MAP-007", "Seni dan Budaya", "B", "Fase D", "3 JP", "Ibu Ratna", "Mata pelajaran pilihan"},
		{"", "MAP-008", "Pendidikan Jasmani", "B", "Fase D", "2 JP", "Pak Joko", "Mata pelajaran wajib"},
		{"", "MAP-009", "Informatika", "C", "Fase D", "3 JP", "Kak Fira", "Mata pelajaran pilihan"},
		{"", "MAP-010", "Bahasa Jawa", "C", "Fase D", "2 JP", "Bu Darmi", "Muatan lokal"},
	}

	for i, sample := range samples {
		row := i + 2
		for j, val := range sample {
			cell, _ := excelize.CoordinatesToCellName(j+1, row)
			f.SetCellValue("Mata Pelajaran", cell, val)
			f.SetCellStyle("Mata Pelajaran", cell, cell, normalStyle)
		}
	}

	// Set column widths
	colWidths := []float64{10, 12, 30, 12, 12, 15, 25, 30}
	for i, w := range colWidths {
		colName, _ := excelize.CoordinatesToCellName(i+1, 1)
		colName = colName[:1]
		f.SetColWidth("Mata Pelajaran", colName, colName, w)
	}

	// Add instructions sheet
	f.NewSheet("Instruksi")
	instructions := []string{
		"TEMPLATE IMPORT MATA PELAJARAN",
		"",
		"Cara Menggunakan:",
		"1. Isi data mulai dari baris 2 (baris 1 adalah header)",
		"2. Kolom ID boleh dikosongkan (akan auto-generate)",
		"3. Kolom NAMA wajib diisi",
		"4. Kolom KELOMPOK: A, B, atau C",
		"5. Kolom FASE: Fase A/B/C/D/E/F",
		"6. Simpan file setelah selesai mengisi",
		"7. Upload file di halaman Import",
		"",
		"Keterangan Kolom:",
		"- ID: UUID (kosongkan untuk data baru)",
		"- Kode: Kode mata pelajaran (contoh: MAP-001)",
		"- Nama: Nama mata pelajaran (WAJIB)",
		"- Kelompok: A=Wajib, B=Wajib Pilihan, C=Pilihan",
		"- Fase: Fase pembelajaran",
		"- JP Per Minggu: Jumlah jam pelajaran per minggu",
		"- Guru: Nama guru pengampu",
		"- Keterangan: Catatan tambahan",
	}

	instructionStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Size: 10},
	})

	for i, instr := range instructions {
		cell, _ := excelize.CoordinatesToCellName(1, i+1)
		f.SetCellValue("Instruksi", cell, instr)
		f.SetCellStyle("Instruksi", cell, cell, instructionStyle)
	}

	f.SetColWidth("Instruksi", "A", "A", 50)

	// Save file
	if err := f.SaveAs("mapel_export_template.xlsx"); err != nil {
		log.Fatal(err)
	}

	fmt.Println("✓ Template Excel berhasil dibuat: mapel_export_template.xlsx")
}
