# SDolphin - Modern SSH File Manager

SDolphin is a cross-platform desktop application built with Electron, React, and TypeScript for managing files on remote Linux servers over SSH/SFTP.

## Features

- **Secure Connection**: Support for Password and PEM/Private Key authentication.
- **Native-like Explorer**: Navigate remote filesystems with grid and list views.
- **Integrated Terminal**: Fully functional xterm.js terminal synced with your SSH session.
- **In-app Editor**: Built-in Monaco Editor with syntax highlighting for remote files.
- **System Stats**: Live visualization of remote CPU, RAM, and Disk usage.
- **Premium UI**: Modern dark theme with smooth animations and responsive layout.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Zustand.
- **Backend**: Electron, Node.js, `ssh2`, `ssh2-sftp-client`.
- **Development**: Vite, `electron-vite`.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd SDolphin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

### Building for Production

To create a production build for your OS:
```bash
npm run build
```

## Security

SDolphin follows Electron security best practices:
- Renderer process is sandboxed.
- `nodeIntegration` is disabled in the renderer.
- All IPC communication happens through a secure `contextBridge`.
- Credentials are never stored in plaintext (using local storage with the potential for encrypted vault integration).

## License

MIT
