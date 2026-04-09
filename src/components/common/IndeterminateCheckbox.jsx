import { useEffect, useRef } from 'react';

export default function IndeterminateCheckbox({ indeterminate = false, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return <input ref={ref} type="checkbox" {...props} />;
}
