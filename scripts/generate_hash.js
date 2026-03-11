import bcrypt from "bcryptjs";

const password = 'Admin123*'
const hash = await bcrypt.hash(password, 10)

console.log('hash generado: ')
console.log(hash)

