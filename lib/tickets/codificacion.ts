const BYTES_UTF8_BOM = [0xef, 0xbb, 0xbf];
const BYTES_UTF16LE_BOM = [0xff, 0xfe];
const BYTES_UTF16BE_BOM = [0xfe, 0xff];

function empiezaCon(bytes: Uint8Array, prefijo: number[]): boolean {
  if (bytes.length < prefijo.length) return false;
  return prefijo.every((valor, indice) => bytes[indice] === valor);
}

function pareceUtf16(bytes: Uint8Array): "le" | "be" | null {
  const muestra = bytes.subarray(0, Math.min(bytes.length, 512));
  if (muestra.length < 4) return null;
  let nulosPares = 0;
  let nulosImpares = 0;
  for (let indice = 0; indice < muestra.length; indice++) {
    if (muestra[indice] === 0) {
      if (indice % 2 === 0) nulosPares++;
      else nulosImpares++;
    }
  }
  const umbral = muestra.length / 8;
  if (nulosImpares > umbral && nulosPares === 0) return "le";
  if (nulosPares > umbral && nulosImpares === 0) return "be";
  return null;
}

/**
 * Decodifica un archivo de texto detectando BOM y codificación:
 * UTF-8 (con o sin BOM), UTF-16 (con BOM o heurística de bytes nulos) y, como
 * último recurso, windows-1252 para exportaciones antiguas en Latin-1.
 */
export function decodificarTexto(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if (empiezaCon(bytes, BYTES_UTF8_BOM)) {
    return new TextDecoder("utf-8").decode(bytes.subarray(3));
  }
  if (empiezaCon(bytes, BYTES_UTF16LE_BOM)) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  if (empiezaCon(bytes, BYTES_UTF16BE_BOM)) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  }

  const utf16 = pareceUtf16(bytes);
  if (utf16 === "le") return new TextDecoder("utf-16le").decode(bytes);
  if (utf16 === "be") return new TextDecoder("utf-16be").decode(bytes);

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}
