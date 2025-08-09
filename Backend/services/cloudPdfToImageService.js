const { v2: cloudinary } = require('cloudinary');

class CloudPDFToImageService{
    constructor(){
        if(!cloudinary.config().cloud_name){
            throw new Error('Cloudinary configuration is required');
        }
    }

    async converPDFToImage(pdfUrl,resumeId){
        try {
            console.log('🖼️ Converting PDF to image using Cloudinary transformation...');
            console.log('📄 PDF URL:', pdfUrl);

            const publicId = this.extractPublicid(pdfUrl);
            console.log('🔍 Extracted public_id:', publicId);

            const imageUrl = cloudinary.url(publicId,{
                resource_type: 'image',
                format: 'png',
                page: 1,
                width: 800,
                height: 1100,
                crop: 'limit',
                quality: 'auto:good',
                fetch_format: 'auto',
                flags: 'attachment'
            });

            console.log('✅ Image URL generated:', imageUrl);

            await this.validateImageUrl(imageUrl);

            console.log('✅ PDF to image conversion completed successfully');
            return imageUrl;
        } catch (error) {
            console.error('❌ PDF to image conversion error:', error);
            return this.createPlaceholderImage(resumeId);
        }
    }

    extractPublicid(cloudinaryUrl){
        try {
            const urlParts = cloudinaryUrl.split('/');

            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if(uploadIndex === -1){
                throw new Error('Invalid Cloudinary URL format');
            }

            const pathAfterVersion = urlParts.slice(uploadIndex+2).join('/');

            console.log('📂 Extracted path:', pathAfterVersion);
            return pathAfterVersion;
        } catch (error) {
            console.error('❌ Error extracting public_id:', error);
            throw new Error(`Invalid Cloudinary URL: ${error.message}`);
        }
    }

    async validateImageUrl(imageUrl){
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(imageUrl,{ method: 'HEAD' });

            if(!response.ok){
                throw new Error(`Image URL validation failed: ${ response.status}`);
            }

            console.log('✅ Image URL validation successful');
            return true;
        } catch (error) {
            console.warn('⚠️ Image URL validation failed:', error.message);
            throw error;
        }
    }

    createPlaceholderImage(resumeId){
        console.log('🎨 Creating placeholder image...');

        const placeholder = cloudinary.url('placeholder',{
            resource_type: 'image',
            width: 800,
            height: 1100,
            crop: 'limit',
            background: 'white',
            color: 'gray',
            overlay: {
                font_family: 'Arial',
                font_size: 60,
                text: 'Resume%20Preview%0ANot%20Available'
            },
            format: 'png'
        });

        console.log('✅ Placeholder image created');
        return placeholderUrl;
    }

    async uploadAndConvertPDF(pdfBuffer,resumeId){
        try {
            console.log('🖼️ Uploading PDF buffer and converting to image...');

            const result = await new Promise((resolve,reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    resource_type: 'image',
                    folder: 'resume-images',
                    public_id: `resume-image_${resumeId}`,
                    format: 'png',
                    page: 1,
                    width: 800,
                    height: 1100,
                    crop: 'limit',
                    quality: 'auth:good',
                    transformation: [
                        { fetch_format: 'auto'},
                        { flags: 'attachment' }
                    ]
                },
                    (error,result) => {
                        if(error){
                            console.log('Cloudinary upload error: ',error);
                            reject(error);
                        }
                        else{
                            resolve(error);
                        }
                    }
                );

                uploadStream.end(pdfBuffer);
            });

            console.log('✅ PDF uploaded and converted to image successfully');
            return result.secure_url;
        } catch (error) {
            console.error('❌ Upload and convert error:', error);
            return this.createPlaceholderImage(resumeId);
        }
    }

    async getMultipleFormats(pdfUrl,resumeid){
        try {
            const publicId = this.extractPublicId(pdfUrl);

            const formats = {
                thumbnail: cloudinary.url(publicId,{
                    resource_type: 'image',
                    format: 'jpg',
                    page: 1,
                    width: 200,
                    height: 260,
                    crop: 'fill',
                    quality: 'auto:good'
                }),
                preview: cloudinary.url(publicId,{
                    resource_type: 'image',
                    format: 'png',
                    page: 1,
                    width: 200,
                    height: 260,
                    crop: 'fill',
                    
                })
            }
        } catch (error) {
            
        }
    }
}