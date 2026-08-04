from langchain_huggingface.embeddings import HuggingFaceEndpointEmbeddings
from app.core.config import settings

embeddings = HuggingFaceEndpointEmbeddings(
    model=settings.EMBEDDING_MODEL,
    task="feature-extraction",

    huggingfacehub_api_token = settings.HUGGINGFACEHUB_API_TOKEN
)