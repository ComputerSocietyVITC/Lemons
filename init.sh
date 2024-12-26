#!/bin/bash
pnpm dlx prisma migrate deploy
pnpm dlx prisma generate
pnpm run build
pnpm run start