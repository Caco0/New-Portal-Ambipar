export default ({ env }) => ({
    upload: {
        config: {
        provider: 'local',
        providerOptions: {
            // Em Strapi v5, 'sizeLimit' deve ficar FORA de providerOptions
        },
        sizeLimit: 10 * 1024 * 1024, // 10 MB

        security: {
            allowedTypes: [
                'image/jpeg',
                'image/png',
                'image/webp'
                ],
            },

        baseUrl: 'http://10.0.0.197:1337/uploads',

        mimeTypes: [
            // IMAGENS
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',

            // VÍDEOS
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/x-matroska',        // MKV
            'video/quicktime',         // MOV

            // ÁUDIOS
            'audio/mpeg',
            'audio/ogg',
            'audio/wav',

            // DOCUMENTOS
            'application/pdf',

            // WORD
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

            // EXCEL
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

            // POWERPOINT
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',

            // TEXTOS
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'text/xml',

            // COMPACTADOS
            'application/zip',
            'application/x-rar-compressed',
        ],
        },
    },
});
