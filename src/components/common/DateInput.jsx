function openNativePicker(event) {
  if (typeof event.currentTarget.showPicker === 'function') {
    event.currentTarget.showPicker();
  }
}

function preventManualTyping(event) {
  const allowedKeys = ['Tab', 'Shift', 'Escape'];
  if (allowedKeys.includes(event.key)) return;
  event.preventDefault();
}

export default function DateInput(props) {
  return (
    <input
      {...props}
      type="date"
      inputMode="none"
      onFocus={(event) => {
        openNativePicker(event);
        props.onFocus?.(event);
      }}
      onClick={(event) => {
        openNativePicker(event);
        props.onClick?.(event);
      }}
      onKeyDown={(event) => {
        preventManualTyping(event);
        props.onKeyDown?.(event);
      }}
    />
  );
}
