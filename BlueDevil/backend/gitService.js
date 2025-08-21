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
    
    try {
      // Check if directory exists
      await fs.access(projectDir);
      
      // Check if it's already a git repo
      try {
        await execAsync('git status', { cwd: projectDir });
        return projectDir;
      } catch (error) {
        // Not a git repo, initialize it
        await execAsync('git init', { cwd: projectDir });
        await execAsync('git config user.name "Salesfive Platform"', { cwd: projectDir });
        await execAsync('git config user.email "platform@salesfive.com"', { cwd: projectDir });
        return projectDir;
      }
    } catch (error) {
      // Directory doesn't exist, create it and initialize git
      await fs.mkdir(projectDir, { recursive: true });
      await execAsync('git init', { cwd: projectDir });
      await execAsync('git config user.name "Salesfive Platform"', { cwd: projectDir });
      await execAsync('git config user.email "platform@salesfive.com"', { cwd: projectDir });
      
      // Create .gitignore
      await fs.writeFile(path.join(projectDir, '.gitignore'), '*.tmp\n*.log\n.DS_Store\n');
      
      // Initial commit
      await execAsync('git add .', { cwd: projectDir });
      await execAsync('git commit -m "Initial commit"', { cwd: projectDir });
      
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
      
      // Add to git
      console.log(`📁 addFile: Adding file to git...`);
      await execAsync(`git add "${fileName}"`, { cwd: projectDir });
      console.log(`📁 addFile: File added to git index`);
      
      // Commit with author info
      let commitCmd = `git commit -m "${commitMessage}"`;
      if (author) {
        commitCmd += ` --author="${author.name} <${author.email}>"`;
      }
      
      console.log(`📁 addFile: Committing with command: ${commitCmd}`);
      await execAsync(commitCmd, { cwd: projectDir });
      console.log(`📁 addFile: Commit successful`);
      
      const commitHash = await this.getLatestCommitHash(projectDir);
      console.log(`📁 addFile: Latest commit hash: ${commitHash}`);
      
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
    
    try {
      // Check if file exists
      await fs.access(fullPath);
      
      // Write new content
      await fs.writeFile(fullPath, content);
      
      // Add to git
      await execAsync(`git add "${fileName}"`, { cwd: projectDir });
      
      // Commit with author info
      let commitCmd = `git commit -m "${commitMessage}"`;
      if (author) {
        commitCmd += ` --author="${author.name} <${author.email}>"`;
      }
      
      await execAsync(commitCmd, { cwd: projectDir });
      
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
    
    try {
      const { stdout } = await execAsync(
        `git log --follow --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso "${fileName}"`,
        { cwd: projectDir }
      );
      
      if (!stdout.trim()) {
        return [];
      }
      
      return stdout.trim().split('\n').map(line => {
        const [hash, author, email, date, message] = line.split('|');
        return {
          hash,
          author,
          email,
          date: new Date(date),
          message
        };
      });
    } catch (error) {
      console.error('Git get file history error:', error);
      return [];
    }
  }

  async getFileContent(projectId, fileName, commitHash = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      let cmd = `git show`;
      if (commitHash) {
        cmd += ` ${commitHash}:${fileName}`;
      } else {
        cmd += ` HEAD:${fileName}`;
      }
      
      const { stdout } = await execAsync(cmd, { cwd: projectDir });
      return stdout;
    } catch (error) {
      console.error('Git get file content error:', error);
      throw new Error(`Failed to get file content: ${error.message}`);
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

  async setupGitHubRepo(projectId, githubToken, repoName, repoUrl = null) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      let repoData;
      
      if (repoUrl) {
        // Use existing repository
        const repoUrlParts = repoUrl.replace('https://github.com/', '').split('/');
        const owner = repoUrlParts[0];
        const repo = repoUrlParts[1];
        
        // Verify repository exists and we have access
        const verifyCmd = `curl -s -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/${owner}/${repo}`;
        const { stdout: verifyData } = await execAsync(verifyCmd);
        repoData = JSON.parse(verifyData);
        
        if (repoData.message === 'Not Found') {
          throw new Error('Repository not found or access denied. Please check the URL and your token permissions.');
        }
        
        // Add remote origin with token authentication
        const remoteUrl = `https://${githubToken}@github.com/${owner}/${repo}.git`;
        
        // Check if remote origin already exists
        try {
          await execAsync('git remote get-url origin', { cwd: projectDir });
          // Remote exists, update it
          await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: projectDir });
        } catch (error) {
          // Remote doesn't exist, add it
          await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectDir });
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
        
        // Check if remote origin already exists
        try {
          await execAsync('git remote get-url origin', { cwd: projectDir });
          // Remote exists, update it
          await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: projectDir });
        } catch (error) {
          // Remote doesn't exist, add it
          await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectDir });
        }
      }
      
      // Push to GitHub
      try {
        await execAsync('git push -u origin main', { cwd: projectDir });
      } catch (pushError) {
        console.log(`GitHub setup: Push to main failed: ${pushError.message}`);
        
        // Check if it's a "fetch first" error (remote has commits we don't have)
        if (pushError.message.includes('fetch first') || pushError.message.includes('rejected')) {
          console.log(`GitHub setup: Remote has commits we don't have, pulling first...`);
          try {
            // Pull remote changes first
            await execAsync('git pull origin main --allow-unrelated-histories', { cwd: projectDir });
            console.log(`GitHub setup: Successfully pulled remote changes`);
            
            // Now try to push again
            await execAsync('git push -u origin main', { cwd: projectDir });
            console.log(`GitHub setup: Successfully pushed after pull`);
          } catch (pullError) {
            console.log(`GitHub setup: Pull failed: ${pullError.message}`);
            
            // If pull fails, try to force push (only for new repositories)
            try {
              console.log(`GitHub setup: Trying force push...`);
              await execAsync('git push -u origin main --force', { cwd: projectDir });
              console.log(`GitHub setup: Successfully force pushed`);
            } catch (forceError) {
              console.error(`GitHub setup: Force push failed: ${forceError.message}`);
              throw forceError;
            }
          }
        } else if (pushError.message.includes('main')) {
          // If main branch doesn't exist, try master branch
          try {
            await execAsync('git push -u origin master', { cwd: projectDir });
          } catch (masterError) {
            console.log(`GitHub setup: Push to master failed: ${masterError.message}`);
            
            // Check current branch
            try {
              const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: projectDir });
              console.log(`GitHub setup: Current branch is: ${currentBranch.trim()}`);
              
              // Try to push current branch
              await execAsync(`git push -u origin ${currentBranch.trim()}`, { cwd: projectDir });
            } catch (currentBranchError) {
              console.log(`GitHub setup: Push current branch failed: ${currentBranchError.message}`);
              
              // If all else fails, try to create main branch only if it doesn't exist
              try {
                const { stdout: branches } = await execAsync('git branch', { cwd: projectDir });
                if (!branches.includes('main')) {
                  await execAsync('git checkout -b main', { cwd: projectDir });
                  await execAsync('git push -u origin main', { cwd: projectDir });
                } else {
                  // Switch to main branch and push
                  await execAsync('git checkout main', { cwd: projectDir });
                  await execAsync('git push -u origin main', { cwd: projectDir });
                }
              } catch (finalError) {
                throw finalError;
              }
            }
          }
        } else {
          console.error(`GitHub setup: Push failed with error: ${pushError.message}`);
          throw pushError;
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

  async deleteFile(projectId, fileName, commitMessage) {
    const projectDir = await this.ensureProjectRepo(projectId);
    
    try {
      await execAsync(`git rm "${fileName}"`, { cwd: projectDir });
      await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectDir });
      
      return { success: true };
    } catch (error) {
      console.error('Git delete file error:', error);
      throw new Error(`Failed to delete file from git: ${error.message}`);
    }
  }
}

module.exports = new GitService();
