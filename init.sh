#!/bin/bash
pnpm dlx prisma migrate deploy
pnpm dlx prisma generate
pnpm dlx build
pnpm dlx run start