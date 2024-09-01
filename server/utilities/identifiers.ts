export const generateRoomId = () => {
   let result = '';
   const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
   const charactersLength = characters.length;
   for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
};
