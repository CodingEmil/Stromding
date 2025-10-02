// GitHub API Service für Datenspeicherung
const GITHUB_OWNER = 'CodingEmil';
const GITHUB_REPO = 'Stromding';
const DATA_BRANCH = 'user-data'; // Separater Branch für Benutzerdaten

export interface GitHubUserData {
  users: {
    [email: string]: {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
      createdAt: string;
      tarife: any[];
      settings: {
        defaultVerbrauch: number;
        theme: 'dark' | 'light';
      };
    };
  };
}

class GitHubDataService {
  private githubToken: string | null = null;

  // GitHub Token setzen (wird vom Benutzer eingegeben)
  setToken(token: string) {
    this.githubToken = token;
    localStorage.setItem('github_token', token);
  }

  // GitHub Token laden
  getToken(): string | null {
    if (!this.githubToken) {
      this.githubToken = localStorage.getItem('github_token');
    }
    return this.githubToken;
  }

  // GitHub API Request
  private async githubRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('GitHub Token ist erforderlich');
    }

    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'GitHub API Error' }));
      throw new Error(error.message || `GitHub API Error: ${response.status}`);
    }

    return response.json();
  }

  // Benutzerdaten-Datei laden
  async loadUserData(): Promise<GitHubUserData> {
    try {
      const fileData = await this.githubRequest(
        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/users.json?ref=${DATA_BRANCH}`
      );
      
      const content = atob(fileData.content.replace(/\s/g, ''));
      return JSON.parse(content);
    } catch (error) {
      // Datei existiert noch nicht, leere Struktur zurückgeben
      return { users: {} };
    }
  }

  // Benutzerdaten-Datei speichern
  async saveUserData(data: GitHubUserData, sha?: string): Promise<void> {
    const content = btoa(JSON.stringify(data, null, 2));
    
    const requestBody: any = {
      message: `Update user data - ${new Date().toISOString()}`,
      content,
      branch: DATA_BRANCH,
    };

    if (sha) {
      requestBody.sha = sha;
    }

    await this.githubRequest(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/users.json`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }
    );
  }

  // Branch erstellen falls nicht vorhanden
  async ensureDataBranch(): Promise<void> {
    try {
      // Prüfen ob Branch existiert
      await this.githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${DATA_BRANCH}`);
    } catch (error) {
      // Branch erstellen
      const mainBranch = await this.githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/main`);
      
      await this.githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${DATA_BRANCH}`,
          sha: mainBranch.object.sha,
        }),
      });

      // data Ordner erstellen
      await this.githubRequest(
        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/.gitkeep`,
        {
          method: 'PUT',
          body: JSON.stringify({
            message: 'Initialize user data branch',
            content: btoa(''),
            branch: DATA_BRANCH,
          }),
        }
      );
    }
  }
}

export const githubDataService = new GitHubDataService();
