import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="docjytgd5",
    api_key="129411373286887",
    api_secret="bHIW9yCCSOM1tXU-N_i-69EZXeg"
)   


from fastapi import FastAPI, File, UploadFile
import cloudinary.uploader

app = FastAPI()

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    
    result = cloudinary.uploader.upload(file.file)
    
    image_url = result["secure_url"]
    
    return {
        "url": image_url
    }