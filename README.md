# GitAutomator

GitAutomator is an intelligent, AI-powered application designed to streamline your development workflow by automating code modifications directly within your GitHub repositories. Simply describe the changes you need in plain English, and let the AI handle the rest—from generating the code to committing and pushing the changes.

![GitAutomator Screenshot](https://placehold.co/800x450.png)
*A screenshot of the main user interface.*

## Core Features

- **🤖 AI-Powered Code Modification**: Leverages generative AI to understand natural language requests and apply code changes to your files.
- **🔐 Secure GitHub Authentication**: Uses GitHub OAuth for secure access to your repositories. Your credentials are never stored on our servers.
- **✍️ Automated Commits & Pushes**: Automatically generates descriptive commit messages and pushes the changes to your selected branch, saving you time and effort.
- **⭐ Repository Bookmarking**: Bookmark your frequently accessed repositories to find them quickly in a dedicated "Favorites" section.
- **🖥️ Intuitive User Interface**: A clean and straightforward interface built with Next.js and ShadCN UI allows you to select repositories, branches, and files with ease.
- **🚀 Built with a Modern Stack**: Utilizes Next.js, React, TypeScript, Genkit, and Tailwind CSS for a robust and performant experience.

## How It Works

The application follows a simple yet powerful workflow:

1.  **Authenticate**: The user signs in with their GitHub account. The application requests `repo` and `user` scope to access repositories and user information.
2.  **Select**: The user chooses a repository, a branch, and a specific file they wish to modify from dropdown menus.
3.  **Request**: The user types a modification request in natural language (e.g., "Add a loading state to this component" or "Refactor this function to use async/await").
4.  **Process**:
    - The application fetches the raw content of the selected file from the GitHub API.
    - It sends the file content and the user's request to a **Genkit AI flow**.
    - The AI flow processes the input and returns two things: the complete, modified file content and a descriptive commit message.
5.  **Commit & Push**: The application uses the GitHub API to commit the new file content to the selected branch with the AI-generated message.
6.  **Notify**: The user receives a notification indicating whether the operation was successful or if an error occurred.

## Technical Architecture

- **Frontend**: Built with **Next.js** (App Router) and **React** with **TypeScript**.
- **Styling**: Styled with **Tailwind CSS** and **ShadCN UI** components for a modern and responsive design. The color scheme is based on the project's style guidelines (Deep Indigo, Light Gray, Teal).
- **AI Backend**: **Genkit** is used to define and manage the AI flows that power code and commit message generation. The flows interact with Google's Gemini models.
- **GitHub Integration**: All interactions with GitHub—authentication, fetching repositories/files, and committing changes—are handled through server-side actions that call the official **GitHub REST API**.

## Getting Started (Local Development)

To run GitAutomator on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

You will need to create a GitHub OAuth App to get the necessary credentials for authentication.

1.  Go to your GitHub **Settings** -> **Developer settings** -> **OAuth Apps**.
2.  Click **"New OAuth App"**.
3.  Fill in the application details:
    - **Application name**: e.g., "GitAutomator Local"
    - **Homepage URL**: `http://localhost:9002`
    - **Authorization callback URL**: `http://localhost:9002/api/auth/callback/github`
4.  Generate a new client secret and copy both the **Client ID** and the **Client Secret**.

Now, create a `.env` file in the root of your project and add your credentials:

```env
# .env

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# (Optional) Genkit/Gemini API Key for AI features
# Get yours from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

This project was bootstrapped with [Firebase Studio](https://firebase.google.com/studio).