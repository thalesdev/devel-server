// read = 4
// write = 2
// excecute = 1



export function decodeByte(byte: number) {
  const rules = {
    read: 4,
    write: 2,
    excecute: 1
  }
  const usedRules = []
  for (const [rule, value] of Object.entries(rules)) {
    if (value <= byte) {
      usedRules.push(rule)
      byte -= value;
    }
  }
  return usedRules
}
