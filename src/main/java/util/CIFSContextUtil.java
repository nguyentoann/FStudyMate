package util;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import jcifs.CIFSContext;
import jcifs.CIFSException;
import jcifs.Configuration;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.context.SingletonContext;
import jcifs.smb.NtlmPasswordAuthenticator;

/**
 * Utility class for creating CIFS contexts for Samba operations
 */
public class CIFSContextUtil {
    
    private static final Logger logger = Logger.getLogger(CIFSContextUtil.class.getName());
    private static final int BUFFER_SIZE = 4 * 1024 * 1024; // 4MB buffer for better network performance
    private static volatile CIFSContext sharedContext = null;
    private static final Object contextLock = new Object();
    
    /**
     * Creates and returns a shared CIFSContext with optimized settings
     * 
     * @return authenticated context
     * @throws CIFSException if authentication fails
     */
    public static CIFSContext createContext() throws CIFSException {
        if (sharedContext == null) {
            synchronized (contextLock) {
                if (sharedContext == null) {
                    String username = System.getenv("SMB_USERNAME");
                    String password = System.getenv("SMB_PASSWORD");
                    
                    if (username == null || password == null) {
                        logger.severe("SMB credentials not found in environment variables");
                        throw new CIFSException("SMB credentials not set in environment. Please run load-env.bat first.");
                    }
                    
                    try {
                        // Optimize JCIFS configuration for better performance
                        Properties props = new Properties();
                        props.setProperty("jcifs.smb.client.responseTimeout", "30000");
                        props.setProperty("jcifs.smb.client.soTimeout", "35000");
                        props.setProperty("jcifs.smb.client.connTimeout", "60000");
                        props.setProperty("jcifs.smb.client.sessionTimeout", "60000");
                        props.setProperty("jcifs.netbios.cachePolicy", "-1");
                        props.setProperty("jcifs.smb.client.dfs.disabled", "true");
                        props.setProperty("jcifs.smb.client.useExtendedSecurity", "false");
                        props.setProperty("jcifs.smb.client.bufferSize", String.valueOf(BUFFER_SIZE));
                        
                        // Additional performance optimizations
                        props.setProperty("jcifs.smb.client.maxMpxCount", "50"); // Allow more multiplexed requests
                        props.setProperty("jcifs.smb.client.tcpNoDelay", "true"); // Disable Nagle's algorithm
                        props.setProperty("jcifs.smb.client.useNTStatus", "true"); // More efficient status codes
                        props.setProperty("jcifs.smb.client.flags2", "0x0007"); // Set optimal SMB flags
                        
                        Configuration config = new PropertyConfiguration(props);
                        CIFSContext baseContext = new BaseContext(config);
                        
                        // Create NTLM authenticator
                        NtlmPasswordAuthenticator auth = new NtlmPasswordAuthenticator("", username, password);
                        
                        // Create and store context with credentials
                        sharedContext = baseContext.withCredentials(auth);
                        logger.info("Created highly optimized SMB context with " + BUFFER_SIZE/1024/1024 + "MB buffer size and connection pooling");
                    } catch (Exception e) {
                        logger.log(Level.SEVERE, "Error creating optimized CIFS context: " + e.getMessage(), e);
                        
                        // Fall back to default context if optimization fails
                        NtlmPasswordAuthenticator auth = new NtlmPasswordAuthenticator("", username, password);
                        sharedContext = SingletonContext.getInstance().withCredentials(auth);
                    }
                }
            }
        }
        
        return sharedContext;
    }
} 