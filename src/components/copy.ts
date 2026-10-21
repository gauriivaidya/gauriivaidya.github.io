import { useState } from "react";
/** Copy text to the clipboard; `state` flips to "ok"/"err" for 2.2 s. */
export function useCopy() {
  const [state, setState] = useState<"" | "ok" | "err">("");
  const copy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      setState("ok");
    } catch { setState("err"); }
    setTimeout(() => setState(""), 2200);
  };
  return [state, copy] as const;
}
