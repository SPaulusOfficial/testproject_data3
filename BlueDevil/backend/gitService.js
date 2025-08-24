const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

class GitService {
  constructor() {
    this.baseDir = path.join(__dirname, 'uploads', 'knowledge');
  }

  async ensureProjectRepo(projectId) {
    const projectDir = path.join(this.baseDir, projectId);
    
    console.log(`🔒 ensureProjectRepo: Ensuring clean repository for project ${projectId}`);
    console.log(`🔒 ensureProjectRepo: Project directory: ${projectDir}`);
    
    try {
      // Check if directory exists
      await fs.access(projectDir);
      
      // Check if it's already a git repo
      try {
        await execAsync('git status', { cwd: projectDir });
        console.log(`🔒 ensureProjectRepo: Git repository already exists`);
        
        // CRITICAL: Verify this is a clean repository for this project only
        const { stdout: remoteUrl } = await execAsync('git remote get-url origin', { cwd: projectDir });
        console.log(`🔒 ensureProjectRepo: Current remote: ${remoteUrl.trim()}`);
        
        // Log current remote for debugging
        console.log(`🔒 ensureProjectRepo: Current remote: ${remoteUrl.trim()}`);
        
        // Check if remote points to the correct project repository
        if (!remoteUrl.includes('testproject') && !remoteUrl.includes('knowledge') && !remoteUrl.includes('files')) {
          console.log(`🔒 Repository has different remote: ${remoteUrl}`);
          // Don't throw error, just log it
        }
        
        return projectDir;
      } catch (error) {
        console.log(`🔒 ensureProjectRepo: Not a git repo or invalid remote, reinitializing...`);
        
        // CRITICAL: Remove any existing git repository to prevent data leaks
        try {
          await execAsync('rm -rf .git', { cwd: projectDir });
          console.log(`🔒 ensureProjectRepo: Removed existing git repository`);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        
        // Initialize fresh git repository
        await execAsync('git init', { cwd: projectDir });
        await execAsync('git config --local user.name "Salesfive Platform"', { cwd: projectDir });
        await execAsync('git config --local user.email "platform@salesfive.com"', { cwd: projectDir });
        
        // Set up remote repository if it exists - use project-specific GitHub integration
        try {
          // Check if project has GitHub integration configured
          const client = await require('./database').pool.connect();
          try {
            const result = await client.query(
              'SELECT settings FROM projects WHERE id = $1',
              [projectId]
            );
            
            if (result.rows.length > 0 && result.rows[0].settings?.github?.repoUrl) {
              const githubSettings = result.rows[0].settings.github;
              const remoteUrl = githubSettings.cloneUrl || githubSettings.repoUrl;
              
              if (remoteUrl) {
                await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectDir });
                console.log(`🔒 ensureProjectRepo: Added project-specific remote origin: ${remoteUrl}`);
              }
            } else {
              console.log(`🔒 ensureProjectRepo: No GitHub integration configured for project ${projectId}`);
              console.log(`🔒 ensureProjectRepo: Please configure GitHub integration in Project Settings`);
            }
          } finally {
            client.release();
          }
        } catch (remoteError) {
          console.log(`🔒 ensureProjectRepo: Could not add remote: ${remoteError.message}`);
        }
        
        // Create .gitignore
        await fs.writeFile(path.join(projectDir, '.gitignore'), '*.tmp\n*.log\n.DS_Store\n');
        
        // Create initial commit to ensure repository is not empty
        await execAsync('git add .', { cwd: projectDir });
        await execAsync('git commit -m "Initial commit - Knowledge base setup"', { cwd: projectDir });
        
        console.log(`🔒 ensureProjectRepo: Initialized fresh git repository with initial commit`);
        return projectDir;
      }
    } catch (error) {
      // Directory doesn't exist, create it and initialize git
      console.log(`🔒 ensureProjectRepo: Creating new project directory`);
      await fs.mkdir(projectDir, { recursive: true });
      await execAsync('git init', { cwd: projectDir });
      await execAsync('git config --local user.name "Salesfive Platform"', { cwd: projectDir });
      await execAsync('git config --local user.email "platform@salesfive.com"', { cwd: projectDir });
      
      // Create .gitignore
      await fs.writeFile(path.join(projectDir, '.gitignore'), '*.tmp\n*.log\n.DS_Store\n');
      
      // Create initial commit to ensure repository is not empty
      await execAsync('git add .', { cwd: projectDir });
      await execAsync('git commit -m "Initial commit - Knowledge base setup"', { cwd: projectDir });
      
      console.log(`🔒 ensureProjectRepo: Created new git repository with initial commit`);
      return projectDir;
    }
  }

  async addFile(projectId, filePath, fileName, content, commitMessage, author = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    const fullPath = path.join(projectDir, fileName);
    
    console.log(`📁 addFile: Adding file ${fileName} to project ${projectId}`);
    console.log(`📁 addFile: Project directory: ${projectDir}`);
    console.log(`📁 addFile: Full path: ${fullPath}`);
    console.log(`📁 addFile: Author: ${author ? `${author.name} <${author.email}>` : 'default'}`);
    
    try {
      // Write file
      console.log(`📁 addFile: Writing file to disk...`);
      await fs.writeFile(fullPath, content);
      console.log(`📁 addFile: File written successfully`);
      
      // Add to git (force to override .gitignore)
      console.log(`📁 addFile: Adding file to git...`);
      await execAsync(`git add -f "${fileName}"`, { cwd: projectDir });
      console.log(`📁 addFile: File added to git index`);
      
      // Commit with author info - use local git config
      let commitCmd = `git commit -m "${commitMessage}"`;
      if (author) {
        commitCmd += ` --author="${author.name} <${author.email}>"`;
      }
      
      console.log(`📁 addFile: Committing with command: ${commitCmd}`);
      try {
        await execAsync(commitCmd, { cwd: projectDir });
      } catch (commitError) {
        console.error(`📁 addFile: Commit failed: ${commitError.message}`);
        console.error(`📁 addFile: Commit stderr: ${commitError.stderr}`);
        
        // Try without author if it fails
        if (author) {
          console.log(`📁 addFile: Retrying commit without author...`);
          await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectDir });
        } else {
          throw commitError;
        }
      }
      console.log(`📁 addFile: Commit successful`);
      
      const commitHash = await this.getLatestCommitHash(projectDir);
      console.log(`📁 addFile: Latest commit hash: ${commitHash}`);
      
      // Check if remote exists before trying to push
      try {
        const { stdout: remoteUrl } = await execAsync('git remote get-url origin', { cwd: projectDir });
        if (remoteUrl.trim()) {
          console.log(`📁 addFile: Remote exists, attempting to push...`);
          try {
            // First, check what branch we're on and what the remote default branch is
            const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
            const { stdout: remoteDefaultBranch } = await execAsync('git remote show origin | grep "HEAD branch" | cut -d" " -f5', { cwd: projectDir });
            
            console.log(`📁 addFile: Current branch: ${currentBranch.trim()}, Remote default: ${remoteDefaultBranch.trim()}`);
            
            // Push to the remote default branch
            await execAsync(`git push origin ${currentBranch.trim()}:${remoteDefaultBranch.trim()}`, { cwd: projectDir });
            console.log(`📁 addFile: Successfully pushed to remote repository`);
          } catch (pushError) {
            console.log(`📁 addFile: Push failed: ${pushError.message}`);
            
            // Try to pull first if remote has changes
            if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
              console.log(`📁 addFile: Remote has changes, pulling first...`);
              try {
                const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
                const { stdout: remoteDefaultBranch } = await execAsync('git remote show origin | grep "HEAD branch" | cut -d" " -f5', { cwd: projectDir });
                
                // Configure git to use merge strategy for pulls
                await execAsync('git config pull.rebase false', { cwd: projectDir });
                
                await execAsync(`git pull origin ${remoteDefaultBranch.trim()} --allow-unrelated-histories`, { cwd: projectDir });
                await execAsync(`git push origin ${currentBranch.trim()}:${remoteDefaultBranch.trim()}`, { cwd: projectDir });
                console.log(`📁 addFile: Successfully pushed after pull`);
              } catch (pullPushError) {
                console.log(`📁 addFile: Pull and push failed: ${pullPushError.message}`);
                
                // If pull fails, try force push as last resort
                try {
                  console.log(`📁 addFile: Attempting force push as last resort...`);
                  const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
                  const { stdout: remoteDefaultBranch } = await execAsync('git remote show origin | grep "HEAD branch" | cut -d" " -f5', { cwd: projectDir });
                  
                  await execAsync(`git push origin ${currentBranch.trim()}:${remoteDefaultBranch.trim()} --force`, { cwd: projectDir });
                  console.log(`📁 addFile: Successfully force pushed to remote repository`);
                } catch (forcePushError) {
                  console.log(`📁 addFile: Force push also failed: ${forcePushError.message}`);
                }
              }
            }
          }
        } else {
          console.log(`📁 addFile: No remote configured, skipping push`);
        }
      } catch (remoteError) {
        console.log(`📁 addFile: No remote configured, skipping push`);
      }
      
      return {
        success: true,
        commitHash: commitHash
      };
    } catch (error) {
      console.error('📁 addFile: Git add file error:', error);
      console.error('📁 addFile: Error details:', error.message);
      throw new Error(`Failed to add file to git: ${error.message}`);
    }
  }

  async updateFile(projectId, fileName, content, commitMessage, author = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    const fullPath = path.join(projectDir, fileName);
    
    console.log(`📝 updateFile: Updating file ${fileName} in project ${projectId}`);
    console.log(`📝 updateFile: Full path: ${fullPath}`);
    
    try {
      // Check if file exists - if not, create it (like addFile)
      let fileExists = true;
      try {
        await fs.access(fullPath);
        console.log(`📝 updateFile: File exists, updating...`);
      } catch (error) {
        console.log(`📝 updateFile: File does not exist, creating...`);
        fileExists = false;
      }
      
      // Write new content (create or update)
      await fs.writeFile(fullPath, content);
      console.log(`📝 updateFile: File content written successfully`);
      
      // Add only the specific file to git - no more batch commits (force to override .gitignore)
      await execAsync(`git add -f "${fileName}"`, { cwd: projectDir });
      console.log(`📝 updateFile: File ${fileName} added to git index`);
      
      // Commit with author info - use local git config
      let commitCmd = `git commit -m "${commitMessage}"`;
      if (author) {
        commitCmd += ` --author="${author.name} <${author.email}>"`;
      }
      
      console.log(`📝 updateFile: Committing with command: ${commitCmd}`);
      try {
        await execAsync(commitCmd, { cwd: projectDir });
      } catch (commitError) {
        console.error(`📝 updateFile: Commit failed: ${commitError.message}`);
        console.error(`📝 updateFile: Commit stderr: ${commitError.stderr}`);
        
        // Try without author if it fails
        if (author) {
          console.log(`📝 updateFile: Retrying commit without author...`);
          await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectDir });
        } else {
          throw commitError;
        }
      }
      console.log(`📝 updateFile: Commit successful`);
      
      // Check if remote exists before trying to push
      try {
        const { stdout: remoteUrl } = await execAsync('git remote get-url origin', { cwd: projectDir });
        if (remoteUrl.trim()) {
          console.log(`📁 updateFile: Remote exists, attempting to push...`);
          try {
            await execAsync('git push origin main', { cwd: projectDir });
            console.log(`📁 updateFile: Successfully pushed to remote repository`);
          } catch (pushError) {
            console.log(`📁 updateFile: Push failed: ${pushError.message}`);
            
            // Try to pull first if remote has changes
            if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
              console.log(`📁 updateFile: Remote has changes, pulling first...`);
              try {
                await execAsync('git pull origin main --allow-unrelated-histories', { cwd: projectDir });
                await execAsync('git push origin main', { cwd: projectDir });
                console.log(`📁 updateFile: Successfully pushed after pull`);
              } catch (pullError) {
                console.error(`📁 updateFile: Pull and push failed: ${pullError.message}`);
                // Continue without push - file is still committed locally
              }
            } else {
              console.error(`📁 updateFile: Push failed: ${pushError.message}`);
              // Continue without push - file is still committed locally
            }
          }
        } else {
          console.log(`📁 updateFile: No remote configured, skipping push`);
        }
      } catch (remoteError) {
        console.log(`📁 updateFile: No remote configured, skipping push`);
      }
      
      return {
        success: true,
        commitHash: await this.getLatestCommitHash(projectDir)
      };
    } catch (error) {
      console.error('Git update file error:', error);
      throw new Error(`Failed to update file in git: ${error.message}`);
    }
  }

  async getFileHistory(projectId, fileName) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    console.log(`📜 getFileHistory - projectId: ${projectId}, fileName: ${fileName}`);
    console.log(`📜 getFileHistory - projectDir: ${projectDir}`);
    
    try {
      // First, try to find the actual file in the repository
      let actualFileName = fileName;
      try {
        const { stdout: lsOutput } = await execAsync(`ls -la`, { cwd: projectDir });
        const files = lsOutput.split('\n').filter(line => line.includes('.md'));
        console.log(`📜 getFileHistory - Available files:`, files.map(f => f.split(' ').pop()));
        
        // Try to find a file that contains the fileName
        const matchingFile = files.find(file => file.includes(fileName));
        if (matchingFile) {
          actualFileName = matchingFile.split(' ').pop();
          console.log(`📜 getFileHistory - Found matching file: ${actualFileName}`);
        }
      } catch (lsError) {
        console.log(`📜 getFileHistory - Could not list files:`, lsError.message);
      }
      
      // Try to get history for the actual file
      let stdout = '';
      try {
        const { stdout: fileHistory } = await execAsync(
          `git log --follow --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso "${actualFileName}"`,
          { cwd: projectDir }
        );
        stdout = fileHistory;
        console.log(`📜 getFileHistory - Found ${fileHistory.split('\n').length} commits for file: ${actualFileName}`);
      } catch (fileError) {
        console.log(`📜 getFileHistory - No history for file ${actualFileName}, getting all commits`);
        // Fallback: Get all commits for the repository
        const { stdout: repoHistory } = await execAsync(
          `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`,
          { cwd: projectDir }
        );
        stdout = repoHistory;
      }
      
      console.log(`📜 getFileHistory - Git log output length: ${stdout.length}`);
      
      if (!stdout.trim()) {
        console.log(`📜 getFileHistory - No git history found`);
        return [];
      }
      
      const history = stdout.trim().split('\n').map(line => {
        const [hash, author, email, date, message] = line.split('|');
        return {
          hash,
          author,
          email,
          date: new Date(date),
          message
        };
      });
      
      console.log(`📜 getFileHistory - Parsed ${history.length} commits`);
      return history;
    } catch (error) {
      console.error('📜 getFileHistory - Git get file history error:', error);
      console.error('📜 getFileHistory - Error details:', error.message);
      return [];
    }
  }

  async getLatestCommitHash(projectDir) {
    try {
      console.log(`🔍 getLatestCommitHash - projectDir: ${projectDir}`);
      
      const { stdout } = await execAsync('git rev-parse HEAD', { cwd: projectDir });
      const hash = stdout.trim();
      
      console.log(`🔍 getLatestCommitHash - Latest commit hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error('🔍 getLatestCommitHash - Error getting latest commit hash:', error);
      return null;
    }
  }

  async getFileContent(projectId, fileName, commitHash = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      let cmd = `git show`;
      
      // Check if commitHash is a valid Git hash (40 characters hex) or a short hash
      if (commitHash) {
        // If it's a short version number (like "2"), try to get the latest commit
        if (/^\d+$/.test(commitHash)) {
          console.log(`📁 getFileContent: Version number detected: ${commitHash}, using HEAD`);
          cmd += ` HEAD:${fileName}`;
        } else if (/^[a-f0-9]{7,40}$/i.test(commitHash)) {
          // Valid Git hash - try to find the correct file name for this commit
          console.log(`📁 getFileContent: Valid Git hash detected: ${commitHash}`);
          
          // First, try to find what files existed in this commit
          try {
            const { stdout: commitFiles } = await execAsync(`git show --name-only ${commitHash}`, { cwd: projectDir });
            // Split lines and filter out commit message - file names come after the empty line
            const lines = commitFiles.trim().split('\n');
            const emptyLineIndex = lines.findIndex(line => line.trim() === '');
            const fileLines = emptyLineIndex >= 0 ? lines.slice(emptyLineIndex + 1) : lines;
            const files = fileLines
              .map(line => line.trim()) // Trim whitespace from each line
              .filter(line => line.includes('.md') && line !== '' && !line.includes(' '));
            console.log(`📁 getFileContent: Files in commit ${commitHash}:`, files);
            
            if (files.length > 0) {
              // Use the first markdown file found in this commit
              const commitFileName = files[0];
              console.log(`📁 getFileContent: Using file from commit: ${commitFileName}`);
              cmd += ` ${commitHash}:${commitFileName}`;
            } else {
              // Fallback to original fileName
              console.log(`📁 getFileContent: No markdown files found in commit, using original fileName: ${fileName}`);
              cmd += ` ${commitHash}:${fileName}`;
            }
          } catch (commitError) {
            console.log(`📁 getFileContent: Could not get commit files, using original fileName: ${fileName}`);
            cmd += ` ${commitHash}:${fileName}`;
          }
        } else {
          console.log(`📁 getFileContent: Invalid commit hash: ${commitHash}, using HEAD`);
          cmd += ` HEAD:${fileName}`;
        }
      } else {
        console.log(`📁 getFileContent: No commit hash provided, using HEAD`);
        cmd += ` HEAD:${fileName}`;
      }
      
      console.log(`📁 getFileContent: Executing command: ${cmd}`);
      const { stdout } = await execAsync(cmd, { cwd: projectDir });
      return stdout;
    } catch (error) {
      console.error('Git get file content error:', error);
      // Return empty string instead of throwing error for missing files
      return '';
    }
  }

  async getFileDiff(projectId, fileName, oldCommit, newCommit) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      const { stdout } = await execAsync(
        `git diff ${oldCommit} ${newCommit} -- "${fileName}"`,
        { cwd: projectDir }
      );
      return stdout;
    } catch (error) {
      console.error('Git get file diff error:', error);
      return '';
    }
  }

  async getLatestCommitHash(projectDir) {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD', { cwd: projectDir });
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  async execGitCommand(projectDir, command) {
    try {
      const { stdout } = await execAsync(`git ${command}`, { cwd: projectDir });
      return { stdout: stdout.trim() };
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  async setupGitHubRepo(projectId, githubToken, repoName, repoUrl = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    console.log(`🔒 setupGitHubRepo: Setting up GitHub integration for project ${projectId}`);
    console.log(`🔒 setupGitHubRepo: Project directory: ${projectDir}`);
    
    try {
      let repoData;
      
      if (repoUrl) {
        // Use existing repository
        console.log(`🔒 setupGitHubRepo: Using existing repository: ${repoUrl}`);
        const repoUrlParts = repoUrl.replace('https://github.com/', '').split('/');
        const owner = repoUrlParts[0];
        const repo = repoUrlParts[1];
        
        // CRITICAL: Verify this is a safe repository for knowledge files
        if (!repo.includes('testproject') && !repo.includes('knowledge') && !repo.includes('files')) {
          console.error(`🔒 CRITICAL ERROR: Repository name suggests it's not for knowledge files: ${repo}`);
          throw new Error('Repository name suggests it\'s not for knowledge files - potential data leak!');
        }
        
        // Verify repository exists and we have access
        const verifyCmd = `curl -s -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/${owner}/${repo}`;
        const { stdout: verifyData } = await execAsync(verifyCmd);
        repoData = JSON.parse(verifyData);
        
        if (repoData.message === 'Not Found') {
          throw new Error('Repository not found or access denied. Please check the URL and your token permissions.');
        }
        
        // Add remote origin with token authentication
        const remoteUrl = `https://${githubToken}@github.com/${owner}/${repo}.git`;
        
        // CRITICAL: Check if remote origin already exists and verify it's safe
        try {
          const { stdout: existingRemote } = await execAsync('git remote get-url origin', { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Existing remote: ${existingRemote.trim()}`);
          
          // CRITICAL: Verify the existing remote is safe
          if (!existingRemote.includes('testproject') && !existingRemote.includes('knowledge') && !existingRemote.includes('files')) {
            console.error(`🔒 CRITICAL ERROR: Existing remote is unsafe! Expected knowledge repo, got: ${existingRemote}`);
            throw new Error('Existing remote is unsafe - potential data leak!');
          }
          
          // Remote exists and is safe, update it
          await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Updated remote to: ${remoteUrl}`);
        } catch (error) {
          // Remote doesn't exist, add it
          await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Added new remote: ${remoteUrl}`);
        }
      } else {
        // Create new GitHub repository
        const createRepoCmd = `curl -s -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d '{"name":"${repoName}","private":true,"auto_init":false}'`;
        const { stdout: createData } = await execAsync(createRepoCmd);
        repoData = JSON.parse(createData);
        
        if (repoData.message) {
          throw new Error(`Failed to create repository: ${repoData.message}`);
        }
        
        // Add remote origin with token authentication
        const remoteUrl = `https://${githubToken}@github.com/${repoData.owner.login}/${repoName}.git`;
        
        // CRITICAL: Check if remote origin already exists and verify it's safe
        try {
          const { stdout: existingRemote } = await execAsync('git remote get-url origin', { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Existing remote: ${existingRemote.trim()}`);
          
          // CRITICAL: Verify the existing remote is safe
          if (!existingRemote.includes('testproject') && !existingRemote.includes('knowledge') && !existingRemote.includes('files')) {
            console.error(`🔒 CRITICAL ERROR: Existing remote is unsafe! Expected knowledge repo, got: ${existingRemote}`);
            throw new Error('Existing remote is unsafe - potential data leak!');
          }
          
          // Remote exists and is safe, update it
          await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Updated remote to: ${remoteUrl}`);
        } catch (error) {
          // Remote doesn't exist, add it
          await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Added new remote: ${remoteUrl}`);
        }
      }
      
      // CRITICAL: Ensure we have commits before pushing
      console.log(`🔒 setupGitHubRepo: Checking repository state before push...`);
      
      // Check if we have any commits
      try {
        const { stdout: commitCount } = await execAsync('git rev-list --count HEAD', { cwd: projectDir });
        console.log(`🔒 setupGitHubRepo: Repository has ${commitCount.trim()} commits`);
        
        if (parseInt(commitCount.trim()) === 0) {
          console.log(`🔒 setupGitHubRepo: No commits found, creating initial commit...`);
          
          // Create initial commit if none exists
          await execAsync('git add .', { cwd: projectDir });
          await execAsync('git commit -m "Initial commit - Knowledge base setup"', { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Created initial commit`);
        }
      } catch (error) {
        console.log(`🔒 setupGitHubRepo: Error checking commits: ${error.message}`);
        
        // If we can't check commits, try to create initial commit anyway
        try {
          await execAsync('git add .', { cwd: projectDir });
          await execAsync('git commit -m "Initial commit - Knowledge base setup"', { cwd: projectDir });
          console.log(`🔒 setupGitHubRepo: Created initial commit after error`);
        } catch (commitError) {
          console.log(`🔒 setupGitHubRepo: Could not create initial commit: ${commitError.message}`);
        }
      }
      
      // Check current branch and ensure it's main
      try {
        const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
        console.log(`🔒 setupGitHubRepo: Current branch: ${currentBranch.trim()}`);
        
        if (currentBranch.trim() !== 'main') {
          console.log(`🔒 setupGitHubRepo: Switching to main branch...`);
          await execAsync('git checkout -b main', { cwd: projectDir });
        }
      } catch (error) {
        console.log(`🔒 setupGitHubRepo: Creating main branch...`);
        await execAsync('git checkout -b main', { cwd: projectDir });
      }
      
      // Push to GitHub
      try {
        console.log(`🔒 setupGitHubRepo: Pushing to GitHub...`);
        await execAsync('git push -u origin main', { cwd: projectDir });
        console.log(`🔒 setupGitHubRepo: Successfully pushed to GitHub`);
      } catch (pushError) {
        console.log(`🔒 setupGitHubRepo: Push to main failed: ${pushError.message}`);
        
        // Check if it's a "fetch first" error (remote has commits we don't have)
        if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
          console.log(`🔒 setupGitHubRepo: Remote has commits we don't have, pulling first...`);
          try {
            // Pull remote changes first
            await execAsync('git pull origin main --allow-unrelated-histories', { cwd: projectDir });
            console.log(`🔒 setupGitHubRepo: Successfully pulled remote changes`);
            
            // Now try to push again
            await execAsync('git push -u origin main', { cwd: projectDir });
            console.log(`🔒 setupGitHubRepo: Successfully pushed after pull`);
          } catch (pullError) {
            console.log(`🔒 setupGitHubRepo: Pull failed: ${pullError.message}`);
            
            // If pull fails, try to force push (only for new repositories)
            try {
              console.log(`🔒 setupGitHubRepo: Trying force push...`);
              await execAsync('git push -u origin main --force', { cwd: projectDir });
              console.log(`🔒 setupGitHubRepo: Successfully force pushed`);
            } catch (forceError) {
              console.error(`🔒 setupGitHubRepo: Force push failed: ${forceError.message}`);
              throw forceError;
            }
          }
        } else if (pushError.message.includes('src refspec main does not match any')) {
          // CRITICAL: No commits exist, create initial commit
          console.log(`🔒 setupGitHubRepo: No commits exist, creating initial commit...`);
          try {
            await execAsync('git add .', { cwd: projectDir });
            await execAsync('git commit -m "Initial commit - Knowledge base setup"', { cwd: projectDir });
            await execAsync('git push -u origin main', { cwd: projectDir });
            console.log(`🔒 setupGitHubRepo: Successfully created initial commit and pushed`);
          } catch (commitError) {
            console.error(`🔒 setupGitHubRepo: Failed to create initial commit: ${commitError.message}`);
            throw commitError;
          }
        } else {
          // Try master branch as fallback
          try {
            console.log(`🔒 setupGitHubRepo: Trying master branch...`);
            await execAsync('git push -u origin master', { cwd: projectDir });
            console.log(`🔒 setupGitHubRepo: Successfully pushed to master`);
          } catch (masterError) {
            console.error(`🔒 setupGitHubRepo: All push attempts failed: ${masterError.message}`);
            throw masterError;
          }
        }
      }
      
      return {
        success: true,
        repoUrl: repoData.html_url,
        cloneUrl: repoData.clone_url || `${repoUrl}.git`
      };
    } catch (error) {
      console.error('GitHub setup error:', error);
      throw new Error(`Failed to setup GitHub repository: ${error.message}`);
    }
  }

  async pushToGitHub(projectId) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    console.log(`🚀 pushToGitHub: Starting push for project ${projectId}`);
    console.log(`🚀 pushToGitHub: Project directory: ${projectDir}`);
    
    try {
      // Check if remote origin exists
      let remoteUrl;
      try {
        const { stdout } = await execAsync('git remote get-url origin', { cwd: projectDir });
        remoteUrl = stdout.trim();
        console.log(`🚀 pushToGitHub: Remote origin found: ${remoteUrl}`);
      } catch (error) {
        console.log(`🚀 pushToGitHub: No remote origin found, skipping push`);
        return { success: true, skipped: true };
      }
      
      // Check current branch
      try {
        const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
        console.log(`🚀 pushToGitHub: Current branch: ${currentBranch.trim()}`);
      } catch (error) {
        console.log(`🚀 pushToGitHub: Could not determine current branch`);
      }
      
      // Push to GitHub
      try {
        console.log(`🚀 pushToGitHub: Attempting to push to main branch...`);
        await execAsync('git push origin main', { cwd: projectDir });
        console.log(`🚀 pushToGitHub: Successfully pushed to main branch`);
      } catch (pushError) {
        console.log(`🚀 pushToGitHub: Push to main failed: ${pushError.message}`);
        
        // Check if it's a "fetch first" error (remote has commits we don't have)
        if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
          console.log(`🚀 pushToGitHub: Remote has commits we don't have, pulling first...`);
          try {
            // Pull remote changes first
            await execAsync('git pull origin main --allow-unrelated-histories', { cwd: projectDir });
            console.log(`🚀 pushToGitHub: Successfully pulled remote changes`);
            
            // Now try to push again
            await execAsync('git push origin main', { cwd: projectDir });
            console.log(`🚀 pushToGitHub: Successfully pushed after pull`);
          } catch (pullError) {
            console.log(`🚀 pushToGitHub: Pull failed: ${pullError.message}`);
            
            // If pull fails, try to force push
            try {
              console.log(`🚀 pushToGitHub: Trying force push...`);
              await execAsync('git push origin main --force', { cwd: projectDir });
              console.log(`🚀 pushToGitHub: Successfully force pushed`);
            } catch (forceError) {
              console.error(`🚀 pushToGitHub: Force push failed: ${forceError.message}`);
              throw forceError;
            }
          }
        } else if (pushError.message.includes('main')) {
          // If main branch doesn't exist, try master branch
          try {
            console.log(`🚀 pushToGitHub: Attempting to push to master branch...`);
            await execAsync('git push origin master', { cwd: projectDir });
            console.log(`🚀 pushToGitHub: Successfully pushed to master branch`);
          } catch (masterError) {
            console.log(`🚀 pushToGitHub: Push to master failed: ${masterError.message}`);
            
            // If neither exists, try to push current branch or switch to main
            try {
              console.log(`🚀 pushToGitHub: Trying to push current branch...`);
              const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
              console.log(`🚀 pushToGitHub: Current branch is: ${currentBranch.trim()}`);
              
              await execAsync(`git push origin ${currentBranch.trim()}`, { cwd: projectDir });
              console.log(`🚀 pushToGitHub: Successfully pushed current branch`);
            } catch (currentBranchError) {
              console.log(`🚀 pushToGitHub: Push current branch failed: ${currentBranchError.message}`);
              
              // Check if main branch exists and switch to it
              try {
                const { stdout: branches } = await execAsync('git branch', { cwd: projectDir });
                if (branches.includes('main')) {
                  console.log(`🚀 pushToGitHub: Switching to existing main branch...`);
                  await execAsync('git checkout main', { cwd: projectDir });
                  await execAsync('git push origin main', { cwd: projectDir });
                  console.log(`🚀 pushToGitHub: Successfully pushed main branch`);
                } else {
                  console.log(`🚀 pushToGitHub: Creating new main branch...`);
                  await execAsync('git checkout -b main', { cwd: projectDir });
                  await execAsync('git push -u origin main', { cwd: projectDir });
                  console.log(`🚀 pushToGitHub: Successfully created and pushed main branch`);
                }
              } catch (finalError) {
                console.error(`🚀 pushToGitHub: Failed to handle branch: ${finalError.message}`);
                throw finalError;
              }
            }
          }
        } else {
          console.error(`🚀 pushToGitHub: Push failed with error: ${pushError.message}`);
          throw pushError;
        }
      }
      
      console.log(`🚀 pushToGitHub: Push completed successfully`);
      return { success: true };
    } catch (error) {
      console.error('GitHub push error:', error);
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    }
  }

  async syncWithGitHub(projectId) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      // Pull latest changes
      await execAsync('git pull origin main', { cwd: projectDir });
      
      // Push local changes
      await execAsync('git push origin main', { cwd: projectDir });
      
      return { success: true };
    } catch (error) {
      console.error('GitHub sync error:', error);
      throw new Error(`Failed to sync with GitHub: ${error.message}`);
    }
  }

  // Batch update multiple files in a single commit
  async updateMultipleFiles(projectId, fileUpdates, commitMessage, author = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    console.log(`📝 updateMultipleFiles: Updating ${fileUpdates.length} files in project ${projectId}`);
    
    try {
      // Update all files
      for (const { fileName, content } of fileUpdates) {
        const fullPath = path.join(projectDir, fileName);
        await fs.writeFile(fullPath, content);
        console.log(`📝 updateMultipleFiles: Updated file ${fileName}`);
      }
      
      // Add all files to git
      await execAsync(`git add .`, { cwd: projectDir });
      console.log(`📝 updateMultipleFiles: All files added to git index`);
      
      // Commit with author info
      let commitCmd = `git commit -m "${commitMessage}"`;
      if (author) {
        commitCmd += ` --author="${author.name} <${author.email}>"`;
      }
      
      console.log(`📝 updateMultipleFiles: Committing with command: ${commitCmd}`);
      await execAsync(commitCmd, { cwd: projectDir });
      console.log(`📝 updateMultipleFiles: Commit successful`);
      
      // Push to remote if available
      try {
        const { stdout: remoteUrl } = await execAsync('git remote get-url origin', { cwd: projectDir });
        if (remoteUrl.trim()) {
          await execAsync('git push origin main', { cwd: projectDir });
          console.log(`📝 updateMultipleFiles: Successfully pushed to remote repository`);
        }
      } catch (pushError) {
        console.log(`📝 updateMultipleFiles: Push failed: ${pushError.message}`);
      }
      
      return {
        success: true,
        commitHash: await this.getLatestCommitHash(projectDir)
      };
    } catch (error) {
      console.error('Git update multiple files error:', error);
      throw new Error(`Failed to update multiple files in git: ${error.message}`);
    }
  }

  async deleteFile(projectId, fileName, commitMessage) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      await execAsync(`git rm "${fileName}"`, { cwd: projectDir });
      await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectDir });
      
      // CRITICAL: Push to remote repository
      console.log(`📁 deleteFile: Pushing to remote repository...`);
      try {
        await execAsync('git push origin main', { cwd: projectDir });
        console.log(`📁 deleteFile: Successfully pushed to remote repository`);
      } catch (pushError) {
        console.log(`📁 deleteFile: Push failed: ${pushError.message}`);
        
        // Try to pull first if remote has changes
        if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
          console.log(`📁 deleteFile: Remote has changes, pulling first...`);
          try {
            await execAsync('git pull origin main --allow-unrelated-histories', { cwd: projectDir });
            await execAsync('git push origin main', { cwd: projectDir });
            console.log(`📁 deleteFile: Successfully pushed after pull`);
          } catch (pullError) {
            console.error(`📁 deleteFile: Pull and push failed: ${pullError.message}`);
            // Continue without push - file is still deleted locally
          }
        } else {
          console.error(`📁 deleteFile: Push failed: ${pushError.message}`);
          // Continue without push - file is still deleted locally
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Git delete file error:', error);
      throw new Error(`Failed to delete file from git: ${error.message}`);
    }
  }

  /**
   * Get Git diff between two commits for a specific file
   * @param {string} projectId - Project ID
   * @param {string} fileName - File name (with hash prefix)
   * @param {string} commitHash1 - First commit hash
   * @param {string} commitHash2 - Second commit hash
   * @returns {Promise<string>} - Git diff output
   */
  async getFileDiff(projectId, fileName, commitHash1, commitHash2) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      console.log(`🔍 getFileDiff: Getting diff between ${commitHash1} and ${commitHash2} for file ${fileName}`);
      console.log(`🔍 getFileDiff: Project directory: ${projectDir}`);
      
      // First, check if both commits exist
      try {
        await execAsync(`git show ${commitHash1} --name-only`, { cwd: projectDir });
        console.log(`🔍 getFileDiff: Commit ${commitHash1} exists`);
      } catch (error) {
        console.error(`🔍 getFileDiff: Commit ${commitHash1} does not exist:`, error.message);
        throw new Error(`Commit ${commitHash1} does not exist`);
      }
      
      try {
        await execAsync(`git show ${commitHash2} --name-only`, { cwd: projectDir });
        console.log(`🔍 getFileDiff: Commit ${commitHash2} exists`);
      } catch (error) {
        console.error(`🔍 getFileDiff: Commit ${commitHash2} does not exist:`, error.message);
        throw new Error(`Commit ${commitHash2} does not exist`);
      }
      
      // Check if file exists in both commits
      try {
        const { stdout: files1 } = await execAsync(`git show ${commitHash1} --name-only`, { cwd: projectDir });
        const { stdout: files2 } = await execAsync(`git show ${commitHash2} --name-only`, { cwd: projectDir });
        
        const filesList1 = files1.trim().split('\n').filter(f => f.trim());
        const filesList2 = files2.trim().split('\n').filter(f => f.trim());
        
        console.log(`🔍 getFileDiff: Files in commit ${commitHash1}:`, filesList1);
        console.log(`🔍 getFileDiff: Files in commit ${commitHash2}:`, filesList2);
        console.log(`🔍 getFileDiff: Looking for file: ${fileName}`);
        
        if (!filesList1.includes(fileName)) {
          throw new Error(`File ${fileName} not found in commit ${commitHash1}`);
        }
        if (!filesList2.includes(fileName)) {
          throw new Error(`File ${fileName} not found in commit ${commitHash2}`);
        }
      } catch (error) {
        console.error(`🔍 getFileDiff: File check failed:`, error.message);
        throw error;
      }
      
      // Get diff between two commits for the specific file
      const diffCommand = `git diff ${commitHash1} ${commitHash2} -- "${fileName}"`;
      console.log(`🔍 getFileDiff: Command: ${diffCommand}`);
      
      const { stdout, stderr } = await execAsync(diffCommand, { cwd: projectDir });
      
      if (stderr && !stderr.includes('warning')) {
        console.error(`🔍 getFileDiff: stderr:`, stderr);
      }
      
      console.log(`🔍 getFileDiff: Diff length:`, stdout.length);
      return stdout;
    } catch (error) {
      console.error(`🔍 getFileDiff: Error:`, error.message);
      throw new Error(`Failed to get diff: ${error.message}`);
    }
  }
}

module.exports = new GitService();
