@echo off
title Strapi Ambipar - Inicializando...

:: ==========================================
:: DEFINIR PASTA TEMP DO STRAPI
:: ==========================================
set TEMP=C:\StrapiTemp
set TMP=C:\StrapiTemp

echo ==========================================
echo Iniciando Strapi Ambipar...
echo Usando TEMP: %TEMP%
echo ==========================================

:: Caminho do Strapi
cd /d "C:\Users\rafael.dametto\Documents\New Portal Ambipar\new-portal-ambipar\ambipar-strapi"

:: Criar pasta de logs se não existir
if not exist logs (
    mkdir logs
)

echo Rodando build...
npm run build >> logs\build.log 2>&1

echo Iniciando Strapi em modo PRODUÇÃO...
npm run start >> logs\strapi.log 2>&1

echo ------------------------------------------
echo Strapi finalizado ou encontrou um erro.
echo Veja o arquivo logs\strapi.log
echo ------------------------------------------
pause
