import uvicorn


def dev() -> None:
    """Run the API in development mode (auto-reload)."""
    uvicorn.run("app.main:app", reload=True)


def start() -> None:
    """Run the API in production mode."""
    uvicorn.run("app.main:app")
