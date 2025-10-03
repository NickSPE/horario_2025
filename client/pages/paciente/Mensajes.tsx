import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PacienteMensajes() {
  const [msgs, setMsgs] = useState<string[]>([
    "Dra.: Recuerde tomar su dosis de las 10:00",
  ]);
  const [text, setText] = useState("");
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Mensajes</h2>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje"
          className="h-10 w-full max-w-md rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button
          onClick={() => {
            if (text.trim()) {
              setMsgs(["Tú: " + text.trim(), ...msgs]);
              setText("");
            }
          }}
        >
          Enviar
        </Button>
      </div>
      <ul className="rounded-md border divide-y">
        {msgs.map((m, i) => (
          <li key={i} className="p-3 text-sm">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
