import cloudinary
import cloudinary.uploader
import os
# 🧠 SENIOR ARCHITECTURE: 
# If CLOUDINARY_URL exists in your .env, simply calling config() with 
# secure=True will automatically parse the entire connection string for you!
cloudinary.config( 
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
    api_key = os.environ.get('CLOUDINARY_API_KEY'), 
    api_secret = os.environ.get('CLOUDINARY_API_SECRET'), # Click 'View API Keys' above to copy your API secret
    secure=True
)

def upload_profile_image(file_to_upload):
    """
    Uploads an image file to Cloudinary, optimizes it, and returns the secure URL string.
    """
    try:
        response = cloudinary.uploader.upload(
            file_to_upload,
            folder="brightminds_profiles",
            width= 200, 
            height= 200, 
            crop= "thumb", 
            gravity= "face",
            quality= "auto",
            fetch_format= "auto"
        )
        print(response.get('secure_url'))
        return response.get('secure_url')
    except Exception as e:
        print(f"❌ Cloudinary Upload Error: {str(e)}")
        return None