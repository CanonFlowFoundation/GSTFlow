open System

let charToValue (c: char) =
    if Char.IsDigit(c) then int c - int '0'
    elif Char.IsLetter(c) then int (Char.ToUpper(c)) - int 'A' + 10
    else failwith "Invalid character"

let valueToChar (v: int) =
    if v < 10 then char (v + int '0')
    else char (v - 10 + int 'A')

let calculateCheckDigit (gstinWithoutCheck: string) =
    let factor = 2
    let sum =
        gstinWithoutCheck.ToCharArray()
        |> Array.mapi (fun i c ->
            let value = charToValue c
            let product = value * (if i % 2 = 0 then 1 else 2)
            (product / 36) + (product % 36))
        |> Array.sum
    let remainder = sum % 36
    let checkDigitValue = if remainder = 0 then 0 else 36 - remainder
    valueToChar checkDigitValue

// We want a domestic GSTIN (e.g. 27) that doesn't match PAN structure
// e.g. 27 + 10 digits + 1Z -> 2712345678901Z
let prefix = "2712345678901Z"
let checksum = calculateCheckDigit prefix
printfn "%s%c" prefix checksum
