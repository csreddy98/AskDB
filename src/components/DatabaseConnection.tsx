import React, { useState, useEffect } from 'react';
import { config, getApiEndpoint } from '../config';
import ApiService, { handleApiError } from '../utils/apiService';
import './DatabaseConnection.css';

interface DatabaseCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface ValidationErrors {
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}

interface DatabaseConnectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: DatabaseCredentials) => void;
}

const DatabaseConnection: React.FC<DatabaseConnectionProps> = ({ isOpen, onClose, onConnect }) => {
  const [credentials, setCredentials] = useState<DatabaseCredentials>({
    host: '',
    port: '3306',
    username: '',
    password: '',
    database: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<DatabaseCredentials[]>([]);

  // Load saved credentials from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('dbCredentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedCredentials(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);

  // Save credentials to localStorage
  const saveCredentials = (creds: DatabaseCredentials) => {
    const existing = savedCredentials.filter(
      saved => !(saved.host === creds.host && 
                saved.port === creds.port && 
                saved.database === creds.database &&
                saved.username === creds.username)
    );
    
    const updated = [creds, ...existing].slice(0, 5); // Keep only 5 most recent
    setSavedCredentials(updated);
    localStorage.setItem('dbCredentials', JSON.stringify(updated));
  };

  // Load saved credentials into form
  const loadSavedCredentials = (saved: DatabaseCredentials) => {
    setCredentials(saved);
    setErrors({});
    setTestResult(null);
  };

  // Delete saved credentials
  const deleteSavedCredentials = (index: number) => {
    const updated = savedCredentials.filter((_, i) => i !== index);
    setSavedCredentials(updated);
    localStorage.setItem('dbCredentials', JSON.stringify(updated));
  };

  const validateField = (field: keyof DatabaseCredentials, value: string): string | undefined => {
    switch (field) {
      case 'host':
        if (!value.trim()) return 'Host is required';
        if (value.length < 3) return 'Host must be at least 3 characters';
        // Basic hostname/IP validation
        const hostPattern = /^[a-zA-Z0-9.-]+$/;
        if (!hostPattern.test(value)) return 'Invalid host format';
        return undefined;
      
      case 'port':
        if (!value.trim()) return 'Port is required';
        const portNum = parseInt(value);
        if (isNaN(portNum)) return 'Port must be a number';
        if (portNum < 1 || portNum > 65535) return 'Port must be between 1 and 65535';
        return undefined;
      
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 2) return 'Username must be at least 2 characters';
        if (value.length > 32) return 'Username must be less than 32 characters';
        return undefined;
      
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 3) return 'Password must be at least 3 characters';
        return undefined;
      
      case 'database':
        if (!value.trim()) return 'Database name is required';
        if (value.length < 2) return 'Database name must be at least 2 characters';
        if (value.length > 64) return 'Database name must be less than 64 characters';
        // Basic database name validation (alphanumeric, underscore, hyphen)
        const dbPattern = /^[a-zA-Z0-9_-]+$/;
        if (!dbPattern.test(value)) return 'Database name can only contain letters, numbers, underscores, and hyphens';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const validateAll = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(credentials).forEach((key) => {
      const field = key as keyof DatabaseCredentials;
      const error = validateField(field, credentials[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    return newErrors;
  };

  const handleInputChange = (field: keyof DatabaseCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleBlur = (field: keyof DatabaseCredentials) => {
    const error = validateField(field, credentials[field]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleTestConnection = async () => {
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await ApiService.testConnection(credentials);
      setTestResult({
        success: true,
        message: response.message || 'Connection test successful!'
      });
      
      // Save credentials to localStorage after successful test
      saveCredentials(credentials);
      
      // Notify parent component about successful connection
      onConnect(credentials);
      
    } catch (error) {
      setTestResult({
        success: false,
        message: handleApiError(error)
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCancel = () => {
    setCredentials({
      host: '',
      port: '3306',
      username: '',
      password: '',
      database: '',
    });
    setErrors({});
    setTestResult(null);
    onClose();
  };

  const isFormValid = () => {
    return Object.values(credentials).every(value => value.trim() !== '') &&
           Object.keys(errors).length === 0;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect to MySQL Database</h2>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="db-form">
          {/* Saved Credentials Section */}
          {savedCredentials.length > 0 && (
            <div className="saved-credentials">
              <h3>Saved Connections</h3>
              <div className="saved-list">
                {savedCredentials.map((saved, index) => (
                  <div key={index} className="saved-item">
                    <div className="saved-info" onClick={() => loadSavedCredentials(saved)}>
                      <div className="saved-name">
                        <strong>{saved.database}</strong> on {saved.host}:{saved.port}
                      </div>
                      <div className="saved-details">
                        User: {saved.username}
                      </div>
                    </div>
                    <button 
                      className="delete-saved-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedCredentials(index);
                      }}
                      title="Delete saved connection"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Form */}
          <form onSubmit={(e) => e.preventDefault()} className="connection-form" noValidate>
            <div className={`form-group ${errors.host ? 'has-error' : ''}`}>
              <label htmlFor="host">Host *</label>
              <input
                type="text"
                id="host"
                value={credentials.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                onBlur={() => handleBlur('host')}
                placeholder="localhost or IP address"
                className={errors.host ? 'error' : ''}
                required
              />
              {errors.host && <span className="error-message">{errors.host}</span>}
            </div>
            
            <div className={`form-group ${errors.port ? 'has-error' : ''}`}>
              <label htmlFor="port">Port *</label>
              <input
                type="text"
                id="port"
                value={credentials.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
                onBlur={() => handleBlur('port')}
                placeholder="3306"
                className={errors.port ? 'error' : ''}
                required
              />
              {errors.port && <span className="error-message">{errors.port}</span>}
            </div>
            
            <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                placeholder="Enter username"
                className={errors.username ? 'error' : ''}
                required
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Enter password"
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className={`form-group ${errors.database ? 'has-error' : ''}`}>
              <label htmlFor="database">Database Name *</label>
              <input
                type="text"
                id="database"
                value={credentials.database}
                onChange={(e) => handleInputChange('database', e.target.value)}
                onBlur={() => handleBlur('database')}
                placeholder="Enter database name"
                className={errors.database ? 'error' : ''}
                required
              />
              {errors.database && <span className="error-message">{errors.database}</span>}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleTestConnection}
                className="test-btn"
                disabled={isTesting || !isFormValid()}
              >
                {isTesting ? 'Testing...' : 'Test & Save Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                <span className="test-icon">
                  {testResult.success ? '✅' : '❌'}
                </span>
                <span className="test-message">{testResult.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnection;