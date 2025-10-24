import { PrismaClient } from '@prisma/client'

// Recommended pattern for instantiating Prisma Client in Next.js
// See: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export { db }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db 