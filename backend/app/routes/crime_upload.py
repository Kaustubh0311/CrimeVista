from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile
from fastapi import HTTPException

from sqlalchemy.orm import Session

from backend.app.auth.dependencies import (
    get_db,
    require_role
)

from backend.app.models.user import User

from backend.app.services.crime_upload import (
    process_crime_csv
)


router = APIRouter(
    prefix="/admin/crimes",
    tags=["Admin Crime Management"]
)


@router.post("/upload")
async def upload_crime_csv(

    file: UploadFile = File(...),

    current_user: User = Depends(
        require_role("admin")
    ),

    db: Session = Depends(get_db)

):

    # =========================================
    # CHECK FILE NAME
    # =========================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="File name is missing"
        )


    # =========================================
    # CHECK CSV EXTENSION
    # =========================================

    if not file.filename.lower().endswith(
        ".csv"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed"
        )


    try:

        # =====================================
        # READ FILE
        # =====================================

        file_content = await file.read()


        if not file_content:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )


        # =====================================
        # PROCESS CSV
        #
        # Nagpur validation happens inside
        # process_crime_csv()
        # =====================================

        result = process_crime_csv(
            file_content,
            db
        )


        # =====================================
        # RETURN RESULT
        # =====================================

        return {

            "message":
                "Nagpur crime data upload completed",

            "uploaded_by":
                current_user.email,

            "result":
                result

        }


    except ValueError as error:

        db.rollback()

        raise HTTPException(

            status_code=400,

            detail=str(error)

        )


    except HTTPException:

        db.rollback()

        raise


    except Exception as error:

        db.rollback()

        print(
            "Crime CSV upload error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail="Failed to process crime CSV"

        )