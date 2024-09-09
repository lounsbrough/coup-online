export const generateRoomId = () => {
   const characterCodes = [{ start: 48, count: 10 }, { start: 65, count: 26 }]
      .flatMap(({ start, count }) =>
         Array.from({ length: count }, (_, i) => start + i))

   return Array.from({ length: 6 }, () =>
      String.fromCharCode(characterCodes[Math.floor(Math.random() * characterCodes.length)])
   ).join('')
}
