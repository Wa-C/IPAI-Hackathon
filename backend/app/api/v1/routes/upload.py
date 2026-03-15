"""PDF upload endpoint - extracts text from uploaded PDF files."""

import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.auth import CurrentUser, get_current_user

router = APIRouter(prefix="/upload")


@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(get_current_user),
):
    """
    Upload a PDF file and extract its text content.
    Returns the extracted text that can be used as base material for lessons.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted",
        )

    # Read the file
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large (max 10MB)",
        )

    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())

        extracted = "\n\n".join(pages_text)

        if not extracted.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from PDF (might be scanned/image-based)",
            )

        return {
            "filename": file.filename,
            "pages": len(reader.pages),
            "characters": len(extracted),
            "text": extracted,
        }

    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="pypdf not installed. Run: pip install pypdf",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}",
        )
