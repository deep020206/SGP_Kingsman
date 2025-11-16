/**
 * Admin Authorization Service
 * Manages which email addresses are authorized to have admin/vendor privileges
 */

class AdminAuthService {
  constructor() {
    // Load authorized emails from environment variable
    this.loadAuthorizedEmails();
  }

  /**
   * Load authorized emails from environment variable
   */
  loadAuthorizedEmails() {
    const emailsString = process.env.AUTHORIZED_ADMIN_EMAILS || 'damarodiya8314@gmail.com';
    this.authorizedEmails = emailsString
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
    
    console.log('🔐 Authorized admin emails loaded:', this.authorizedEmails);
  }

  /**
   * Check if an email is authorized for admin access
   * @param {string} email - Email to check
   * @returns {boolean} - True if authorized, false otherwise
   */
  isAuthorizedAdmin(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    return this.authorizedEmails.includes(normalizedEmail);
  }

  /**
   * Get all authorized admin emails
   * @returns {Array} - Array of authorized emails
   */
  getAuthorizedEmails() {
    return [...this.authorizedEmails]; // Return a copy to prevent modification
  }

  /**
   * Add a new authorized email (for future use)
   * @param {string} email - Email to add
   * @returns {boolean} - True if added successfully
   */
  addAuthorizedEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    if (!this.authorizedEmails.includes(normalizedEmail)) {
      this.authorizedEmails.push(normalizedEmail);
      console.log('✅ Added new authorized admin email:', normalizedEmail);
      return true;
    }
    
    return false; // Email already exists
  }

  /**
   * Remove an authorized email (for future use)
   * @param {string} email - Email to remove
   * @returns {boolean} - True if removed successfully
   */
  removeAuthorizedEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const index = this.authorizedEmails.indexOf(normalizedEmail);
    
    if (index !== -1) {
      this.authorizedEmails.splice(index, 1);
      console.log('❌ Removed authorized admin email:', normalizedEmail);
      return true;
    }
    
    return false; // Email not found
  }

  /**
   * Validate admin registration attempt
   * @param {string} email - Email attempting to register as admin
   * @param {string} role - Role being requested
   * @returns {Object} - Validation result
   */
  validateAdminRegistration(email, role) {
    // If role is not admin, no need to check authorization
    if (role !== 'admin') {
      return { isValid: true, message: 'Valid customer registration' };
    }

    // Check if email is authorized for admin role
    if (this.isAuthorizedAdmin(email)) {
      return { 
        isValid: true, 
        message: 'Authorized admin email' 
      };
    }

    return { 
      isValid: false, 
      message: 'Unauthorized admin email. Only authorized personnel can register as admin.' 
    };
  }

  /**
   * Get admin authorization status for an email
   * @param {string} email - Email to check
   * @returns {Object} - Status information
   */
  getAuthorizationStatus(email) {
    const isAuthorized = this.isAuthorizedAdmin(email);
    
    return {
      email: email,
      isAuthorized: isAuthorized,
      role: isAuthorized ? 'admin' : 'customer',
      message: isAuthorized 
        ? 'This email is authorized for admin access' 
        : 'This email has customer-level access only'
    };
  }

  /**
   * Reload authorized emails from environment (useful for runtime updates)
   */
  reloadAuthorizedEmails() {
    console.log('🔄 Reloading authorized admin emails...');
    this.loadAuthorizedEmails();
  }
}

// Export singleton instance
module.exports = new AdminAuthService();