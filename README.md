# KnowDrive 🚀

KnowDrive is a powerful, multi-modal file storage and AI analysis platform. Explore videos, audio, images, and documents with integrated AI transcripts and vector search.

## 🛠️ Quick Start (For Brothers & Contributors)

Follow these steps to get KnowDrive running on your local machine.

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or newer)
- **Docker & Docker Desktop** (Required for the Backend and Office Viewer)
- **Make** (Usually pre-installed on Mac)

#### 🐧 Linux Users
- Ensure your user is in the `docker` group (`sudo usermod -aG docker $USER`).
- The `Makefile` uses the modern `docker compose` command. If you are on an older system using the standalone `docker-compose` binary, you may need to update your Docker CLI or alias the command.

### 2. Initial Setup
Clone the repository and run the setup command:
```bash
make setup
```
This will:
- Install all frontend dependencies.
- Create your `.env.local` file from the template.

### 3. Configure Environment
Open `.env.local` in your code editor and add your API keys for **Clerk** (Auth) and **Stripe** (Payments). You can get these from the project admin.

### 4. Start the Engine
Run the unified dev command:
```bash
make dev
```
This single command:
- Builds and starts the **KnowDB Backend** (Docker).
- Starts the **Collabora Online** Office Viewer (Docker).
- Launches the **Vite Frontend** at `http://localhost:5173`.

## 📂 Project Structure
- `/src`: React frontend components and logic.
- `/knowdb`: Local Rust-based vector database and media processor.
- `/server`: Cloudflare Worker logic (for production deployment).
- `docker-compose.yml`: Orchestration for local services.
- `Makefile`: Shortcut commands for daily development.

## ⌨️ Useful Commands
- `make dev`: Start everything.
- `make status`: Check if Docker services are healthy.
- `make logs`: View backend logs.
- `make down`: Stop background services.
- `make clean`: Reset everything (wipes local DB data).

---
**Happy Coding!** 🚀
