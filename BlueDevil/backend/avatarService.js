const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// Configuration
const AVATAR_CONFIG = {
  // Size limits in bytes
  MAX_DATABASE_SIZE: 100 * 1024, // 100KB - store in database
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB - maximum allowed (before optimization)
  MAX_EXTERNAL_SIZE: 500 * 1024, // 500KB - store externally
  
  // Image optimization
  MAX_DIMENSIONS: { width: 512, height: 512 }, // Larger for better quality
  QUALITY: 0.85, // Slightly lower quality for better compression
  FORMAT: 'webp', // WebP for better compression while maintaining quality
  
  // Color space optimization
  COLOR_SPACE: 'srgb', // Standard RGB for web compatibility
  CHROMA_SUBSAMPLING: '4:4:4', // No chroma subsampling for best quality
  
  // Storage paths
  EXTERNAL_PATH: path.join(__dirname, '../public/avatars'),
  FALLBACK_AVATAR: path.join(__dirname, '../public/avatar.png')
};

class AvatarService {
  constructor() {
    this.ensureDirectories();
  }

  /**
   * Ensure storage directories exist
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(AVATAR_CONFIG.EXTERNAL_PATH, { recursive: true });
    } catch (error) {
      console.log('📁 Avatar directory already exists or could not be created');
    }
  }

  /**
   * Optimize image for avatar use
   */
  async optimizeImage(buffer, originalMimeType) {
    try {
      console.log(`🔄 Optimizing image: ${buffer.length} bytes, type: ${originalMimeType}`);
      
      // Create sharp instance with color space optimization
      let sharpInstance = sharp(buffer, {
        failOnError: false,
        limitInputPixels: false
      });
      
      // Get image metadata
      const metadata = await sharpInstance.metadata();
      console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);
      console.log(`🎨 Original color space: ${metadata.space || 'unknown'}`);
      
      // Preserve original colors completely - no color space manipulation
      
      // Resize if larger than max dimensions
      if (metadata.width > AVATAR_CONFIG.MAX_DIMENSIONS.width || 
          metadata.height > AVATAR_CONFIG.MAX_DIMENSIONS.height) {
        sharpInstance = sharpInstance.resize(
          AVATAR_CONFIG.MAX_DIMENSIONS.width,
          AVATAR_CONFIG.MAX_DIMENSIONS.height,
          {
            fit: 'cover',
            position: 'center'
          }
        );
        console.log(`📏 Resized to: ${AVATAR_CONFIG.MAX_DIMENSIONS.width}x${AVATAR_CONFIG.MAX_DIMENSIONS.height}`);
      }
      
      // Convert to WebP with better compression - preserve original colors
      const optimizedBuffer = await sharpInstance
        .webp({ 
          quality: AVATAR_CONFIG.QUALITY * 100,
          effort: 6, // Higher compression effort
          nearLossless: false, // Disable for better quality control
          smartSubsample: false // Disable smart subsampling to preserve original colors
        })
        .toBuffer();
      
      console.log(`✅ Optimized image: ${optimizedBuffer.length} bytes (${((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1)}% reduction)`);
      
      return {
        buffer: optimizedBuffer,
        mimeType: 'image/webp',
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        reduction: ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1)
      };
      
    } catch (error) {
      console.error('❌ Error optimizing image:', error);
      // Fallback to original if optimization fails
      return {
        buffer: buffer,
        mimeType: originalMimeType,
        originalSize: buffer.length,
        optimizedSize: buffer.length,
        reduction: '0'
      };
    }
  }

  /**
   * Determine storage type based on file size and type
   */
  determineStorageType(fileSize, mimeType) {
    // Check if it's a valid image type
    if (!this.isValidImageType(mimeType)) {
      throw new Error('Invalid image type. Only PNG, JPEG, GIF, and WebP are supported.');
    }

    // Check maximum file size (before optimization)
    if (fileSize > AVATAR_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${AVATAR_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    // After optimization, most images should fit in database
    // We'll determine storage type after optimization
    return 'auto';
  }

  /**
   * Check if MIME type is valid for avatars
   */
  isValidImageType(mimeType) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    return validTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Generate unique filename for external storage
   */
  generateFilename(userId, mimeType) {
    const extension = this.getExtensionFromMimeType(mimeType);
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    return `${userId}_${timestamp}_${hash}.${extension}`;
  }

  /**
   * Get file extension from MIME type
   */
  getExtensionFromMimeType(mimeType) {
    const extensions = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return extensions[mimeType.toLowerCase()] || 'webp'; // Default to webp now
  }

  /**
   * Store avatar data with automatic optimization
   */
  async storeAvatar(userId, buffer, mimeType, originalFilename = null) {
    const originalSize = buffer.length;
    console.log(`🖼️ Processing avatar for user ${userId}: ${originalSize} bytes, type: ${mimeType}`);

    try {
      // Optimize the image
      const optimization = await this.optimizeImage(buffer, mimeType);
      const optimizedBuffer = optimization.buffer;
      const optimizedMimeType = optimization.mimeType;
      const optimizedSize = optimizedBuffer.length;

      // Determine storage type based on optimized size
      let storageType;
      if (optimizedSize <= AVATAR_CONFIG.MAX_DATABASE_SIZE) {
        storageType = 'database';
      } else if (optimizedSize <= AVATAR_CONFIG.MAX_EXTERNAL_SIZE) {
        storageType = 'url';
      } else {
        throw new Error(`Image too large even after optimization (${optimizedSize} bytes). Please try a smaller image.`);
      }

      console.log(`💾 Storage decision: ${storageType} (${optimizedSize} bytes)`);

      let avatarData = null;
      let avatarUrl = null;

      if (storageType === 'database') {
        // Store directly in database
        avatarData = optimizedBuffer;
        avatarUrl = null;
        console.log(`💾 Storing optimized avatar in database for user ${userId}`);
      } else {
        // Store externally
        const filename = this.generateFilename(userId, optimizedMimeType);
        const filePath = path.join(AVATAR_CONFIG.EXTERNAL_PATH, filename);
        
        await fs.writeFile(filePath, optimizedBuffer);
        avatarData = null;
        avatarUrl = `/avatars/${filename}`;
        console.log(`📁 Stored optimized avatar externally: ${filePath}`);
      }

      return {
        avatarData,
        avatarUrl,
        avatarMimeType: optimizedMimeType,
        avatarStorageType: storageType,
        avatarSize: optimizedSize,
        optimization: {
          originalSize,
          optimizedSize,
          reduction: optimization.reduction,
          format: optimizedMimeType
        }
      };

    } catch (error) {
      console.error('❌ Error storing avatar:', error);
      throw new Error(`Failed to store avatar: ${error.message}`);
    }
  }

  /**
   * Get avatar data for display
   */
  async getAvatar(userId, avatarData, avatarUrl, avatarMimeType, avatarStorageType) {
    try {
      if (avatarStorageType === 'database' && avatarData) {
        // Return base64 encoded data for database-stored images
        const base64 = avatarData.toString('base64');
        return {
          src: `data:${avatarMimeType};base64,${base64}`,
          type: 'base64',
          size: avatarData.length
        };
      } else if (avatarStorageType === 'url' && avatarUrl) {
        // Return URL for externally stored images
        return {
          src: avatarUrl,
          type: 'url',
          size: null
        };
      } else {
        // Return fallback avatar
        return this.getFallbackAvatar();
      }
    } catch (error) {
      console.error('❌ Error getting avatar:', error);
      return this.getFallbackAvatar();
    }
  }

  /**
   * Get fallback avatar
   */
  async getFallbackAvatar() {
    try {
      const fallbackData = await fs.readFile(AVATAR_CONFIG.FALLBACK_AVATAR);
      const base64 = fallbackData.toString('base64');
      return {
        src: `data:image/png;base64,${base64}`,
        type: 'fallback',
        size: fallbackData.length
      };
    } catch (error) {
      console.error('❌ Error loading fallback avatar:', error);
      // Return a simple data URI for a 1x1 transparent pixel
      return {
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        type: 'fallback',
        size: 0
      };
    }
  }

  /**
   * Delete avatar files
   */
  async deleteAvatar(userId, avatarUrl, avatarStorageType) {
    try {
      if (avatarStorageType === 'url' && avatarUrl) {
        // Delete external file
        const filename = path.basename(avatarUrl);
        const filePath = path.join(AVATAR_CONFIG.EXTERNAL_PATH, filename);
        
        try {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted external avatar: ${filePath}`);
        } catch (error) {
          // File might not exist, that's okay
          console.log(`📝 External avatar file not found: ${filePath}`);
        }
      }
      // Database-stored avatars are automatically cleaned up when the record is deleted
    } catch (error) {
      console.error('❌ Error deleting avatar:', error);
    }
  }

  /**
   * Update avatar (delete old, store new)
   */
  async updateAvatar(userId, newBuffer, newMimeType, oldAvatarUrl, oldAvatarStorageType) {
    try {
      // Delete old avatar first
      await this.deleteAvatar(userId, oldAvatarUrl, oldAvatarStorageType);
      
      // Store new avatar
      return await this.storeAvatar(userId, newBuffer, newMimeType);
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(AVATAR_CONFIG.EXTERNAL_PATH);
      const stats = {
        externalFiles: files.length,
        externalPath: AVATAR_CONFIG.EXTERNAL_PATH,
        maxDatabaseSize: AVATAR_CONFIG.MAX_DATABASE_SIZE,
        maxExternalSize: AVATAR_CONFIG.MAX_EXTERNAL_SIZE,
        maxFileSize: AVATAR_CONFIG.MAX_FILE_SIZE
      };
      return stats;
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { error: 'Could not read storage statistics' };
    }
  }
}

module.exports = new AvatarService();
