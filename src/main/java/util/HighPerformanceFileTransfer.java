package util;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * High-performance file transfer utility that uses native OS capabilities
 * when available for maximum throughput.
 */
public class HighPerformanceFileTransfer {
    
    private static final Logger logger = Logger.getLogger(HighPerformanceFileTransfer.class.getName());
    
    // Default configuration
    private static final int DEFAULT_BUFFER_SIZE = 8 * 1024 * 1024; // 8MB
    private static final int DEFAULT_THREAD_COUNT = 8;
    private static final long DEFAULT_CHUNK_SIZE = 64 * 1024 * 1024; // 64MB
    
    // Performance tracking
    private static final AtomicLong totalBytesTransferred = new AtomicLong(0);
    private static long startTime = 0;
    
    /**
     * Transfers a file using the most efficient method available for the platform
     * 
     * @param source Source file or input stream
     * @param target Target file or output stream
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If transfer fails
     */
    public static TransferStats transfer(Object source, Object target, TransferOptions options) throws IOException {
        startTime = System.currentTimeMillis();
        totalBytesTransferred.set(0);
        
        // Determine the best transfer method based on source and target types
        if (source instanceof File && target instanceof File) {
            return transferFileToFile((File)source, (File)target, options);
        } else if (source instanceof InputStream && target instanceof OutputStream) {
            return transferStreamToStream((InputStream)source, (OutputStream)target, options);
        } else if (source instanceof File && target instanceof OutputStream) {
            return transferFileToStream((File)source, (OutputStream)target, options);
        } else if (source instanceof InputStream && target instanceof File) {
            return transferStreamToFile((InputStream)source, (File)target, options);
        } else {
            throw new IllegalArgumentException("Unsupported source or target types");
        }
    }
    
    /**
     * Transfers a file to another file using the most efficient method
     * 
     * @param source Source file
     * @param target Target file
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If transfer fails
     */
    private static TransferStats transferFileToFile(File source, File target, TransferOptions options) throws IOException {
        long fileSize = source.length();
        
        // For small files, use a simple copy
        if (fileSize < options.getChunkSize() * 2) {
            return simpleFileCopy(source, target, options);
        }
        
        // For larger files, use parallel transfer
        return parallelFileCopy(source, target, options);
    }
    
    /**
     * Simple file copy for smaller files
     * 
     * @param source Source file
     * @param target Target file
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If copy fails
     */
    private static TransferStats simpleFileCopy(File source, File target, TransferOptions options) throws IOException {
        long fileSize = source.length();
        
        // Try to use zero-copy transfer if possible
        try {
            // Check if we can use native file copy on this platform
            if (tryNativeFileCopy(source, target)) {
                long endTime = System.currentTimeMillis();
                double transferTimeSec = (endTime - startTime) / 1000.0;
                double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
                
                return new TransferStats(fileSize, transferTimeSec, transferRateMBps);
            }
        } catch (Exception e) {
            logger.log(Level.FINE, "Native file copy not available: " + e.getMessage());
        }
        
        // Fall back to NIO transfer
        try (FileInputStream fis = new FileInputStream(source);
             FileOutputStream fos = new FileOutputStream(target);
             FileChannel sourceChannel = fis.getChannel();
             FileChannel targetChannel = fos.getChannel()) {
            
            // Try zero-copy transfer between channels
            long transferred = 0;
            long remaining = fileSize;
            
            while (remaining > 0) {
                long count = sourceChannel.transferTo(
                    transferred, 
                    Math.min(remaining, Integer.MAX_VALUE), 
                    targetChannel
                );
                
                if (count <= 0) {
                    break; // No more bytes can be transferred
                }
                
                transferred += count;
                remaining -= count;
                totalBytesTransferred.addAndGet(count);
            }
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
            
            return new TransferStats(fileSize, transferTimeSec, transferRateMBps);
        }
    }
    
    /**
     * Try to use native OS file copy capabilities
     * 
     * @param source Source file
     * @param target Target file
     * @return true if native copy was successful
     */
    private static boolean tryNativeFileCopy(File source, File target) {
        String os = System.getProperty("os.name").toLowerCase();
        
        try {
            if (os.contains("win")) {
                // On Windows, try to use the system copy command
                Process process = Runtime.getRuntime().exec(
                    new String[] { "cmd.exe", "/c", "copy", "/Y", "/B", 
                                  source.getAbsolutePath(), target.getAbsolutePath() }
                );
                int exitCode = process.waitFor();
                return exitCode == 0;
            } else if (os.contains("nix") || os.contains("nux") || os.contains("mac")) {
                // On Unix/Linux/Mac, try to use cp command
                Process process = Runtime.getRuntime().exec(
                    new String[] { "cp", source.getAbsolutePath(), target.getAbsolutePath() }
                );
                int exitCode = process.waitFor();
                return exitCode == 0;
            }
        } catch (Exception e) {
            logger.log(Level.FINE, "Native file copy failed: " + e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Parallel file copy for larger files
     * 
     * @param source Source file
     * @param target Target file
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If copy fails
     */
    private static TransferStats parallelFileCopy(File source, File target, TransferOptions options) throws IOException {
        long fileSize = source.length();
        
        // Pre-allocate the target file
        try (RandomAccessFile raf = new RandomAccessFile(target, "rw")) {
            raf.setLength(fileSize);
        }
        
        // Calculate chunk count
        int threadCount = options.getThreadCount();
        long chunkSize = options.getChunkSize();
        int chunkCount = (int) Math.ceil((double) fileSize / chunkSize);
        
        // Create thread pool
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        
        try {
            // Submit chunk transfer tasks
            CompletionService<Long> completionService = new ExecutorCompletionService<>(executor);
            
            for (int i = 0; i < chunkCount; i++) {
                final long startOffset = i * chunkSize;
                final long endOffset = Math.min(startOffset + chunkSize, fileSize);
                final int chunkNumber = i + 1;
                
                completionService.submit(() -> {
                    return transferFileChunk(source, target, startOffset, endOffset, chunkNumber, chunkCount);
                });
            }
            
            // Wait for all chunks to complete
            long totalTransferred = 0;
            for (int i = 0; i < chunkCount; i++) {
                try {
                    totalTransferred += completionService.take().get();
                } catch (InterruptedException | ExecutionException e) {
                    throw new IOException("Chunk transfer failed: " + e.getMessage(), e);
                }
            }
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
            
            return new TransferStats(fileSize, transferTimeSec, transferRateMBps);
        } finally {
            executor.shutdown();
        }
    }
    
    /**
     * Transfer a chunk of a file
     * 
     * @param source Source file
     * @param target Target file
     * @param startOffset Start offset
     * @param endOffset End offset
     * @param chunkNumber Chunk number
     * @param totalChunks Total number of chunks
     * @return Number of bytes transferred
     * @throws IOException If transfer fails
     */
    private static long transferFileChunk(File source, File target, long startOffset, long endOffset, 
                                         int chunkNumber, int totalChunks) throws IOException {
        long chunkSize = endOffset - startOffset;
        
        try (RandomAccessFile sourceRaf = new RandomAccessFile(source, "r");
             RandomAccessFile targetRaf = new RandomAccessFile(target, "rw");
             FileChannel sourceChannel = sourceRaf.getChannel();
             FileChannel targetChannel = targetRaf.getChannel()) {
            
            // Use memory-mapped files for maximum performance
            MappedByteBuffer sourceBuffer = sourceChannel.map(
                FileChannel.MapMode.READ_ONLY, startOffset, chunkSize);
            
            // Position the target channel
            targetChannel.position(startOffset);
            
            // Transfer the data
            long bytesWritten = 0;
            while (sourceBuffer.hasRemaining()) {
                bytesWritten += targetChannel.write(sourceBuffer);
            }
            
            totalBytesTransferred.addAndGet(bytesWritten);
            
            return bytesWritten;
        }
    }
    
    /**
     * Transfer from input stream to output stream
     * 
     * @param source Source input stream
     * @param target Target output stream
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If transfer fails
     */
    private static TransferStats transferStreamToStream(InputStream source, OutputStream target, 
                                                      TransferOptions options) throws IOException {
        int bufferSize = options.getBufferSize();
        ByteBuffer buffer = ByteBuffer.allocateDirect(bufferSize);
        byte[] tempBuffer = new byte[bufferSize];
        
        long totalBytes = 0;
        int bytesRead;
        
        while ((bytesRead = source.read(tempBuffer)) != -1) {
            target.write(tempBuffer, 0, bytesRead);
            totalBytes += bytesRead;
            totalBytesTransferred.addAndGet(bytesRead);
        }
        
        target.flush();
        
        long endTime = System.currentTimeMillis();
        double transferTimeSec = (endTime - startTime) / 1000.0;
        double transferRateMBps = (totalBytes / 1024.0 / 1024.0) / transferTimeSec;
        
        return new TransferStats(totalBytes, transferTimeSec, transferRateMBps);
    }
    
    /**
     * Transfer from file to output stream
     * 
     * @param source Source file
     * @param target Target output stream
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If transfer fails
     */
    private static TransferStats transferFileToStream(File source, OutputStream target, 
                                                    TransferOptions options) throws IOException {
        long fileSize = source.length();
        int bufferSize = options.getBufferSize();
        
        try (FileInputStream fis = new FileInputStream(source);
             FileChannel sourceChannel = fis.getChannel()) {
            
            ByteBuffer buffer = ByteBuffer.allocateDirect(bufferSize);
            byte[] tempBuffer = new byte[bufferSize];
            
            while (sourceChannel.read(buffer) != -1) {
                buffer.flip();
                int limit = buffer.limit();
                buffer.get(tempBuffer, 0, limit);
                target.write(tempBuffer, 0, limit);
                totalBytesTransferred.addAndGet(limit);
                buffer.clear();
            }
            
            target.flush();
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (fileSize / 1024.0 / 1024.0) / transferTimeSec;
            
            return new TransferStats(fileSize, transferTimeSec, transferRateMBps);
        }
    }
    
    /**
     * Transfer from input stream to file
     * 
     * @param source Source input stream
     * @param target Target file
     * @param options Transfer options
     * @return Transfer statistics
     * @throws IOException If transfer fails
     */
    private static TransferStats transferStreamToFile(InputStream source, File target, 
                                                    TransferOptions options) throws IOException {
        int bufferSize = options.getBufferSize();
        
        try (FileOutputStream fos = new FileOutputStream(target);
             FileChannel targetChannel = fos.getChannel()) {
            
            ByteBuffer buffer = ByteBuffer.allocateDirect(bufferSize);
            byte[] tempBuffer = new byte[bufferSize];
            
            int bytesRead;
            long totalBytes = 0;
            
            while ((bytesRead = source.read(tempBuffer)) != -1) {
                buffer.clear();
                buffer.put(tempBuffer, 0, bytesRead);
                buffer.flip();
                
                while (buffer.hasRemaining()) {
                    totalBytes += targetChannel.write(buffer);
                }
                
                totalBytesTransferred.addAndGet(bytesRead);
            }
            
            long endTime = System.currentTimeMillis();
            double transferTimeSec = (endTime - startTime) / 1000.0;
            double transferRateMBps = (totalBytes / 1024.0 / 1024.0) / transferTimeSec;
            
            return new TransferStats(totalBytes, transferTimeSec, transferRateMBps);
        }
    }
    
    /**
     * Transfer options class
     */
    public static class TransferOptions {
        private int bufferSize = DEFAULT_BUFFER_SIZE;
        private int threadCount = DEFAULT_THREAD_COUNT;
        private long chunkSize = DEFAULT_CHUNK_SIZE;
        private boolean useDirectBuffers = true;
        
        public TransferOptions() {}
        
        public static TransferOptions createDefault() {
            return new TransferOptions();
        }
        
        public int getBufferSize() {
            return bufferSize;
        }
        
        public TransferOptions setBufferSize(int bufferSize) {
            this.bufferSize = bufferSize;
            return this;
        }
        
        public int getThreadCount() {
            return threadCount;
        }
        
        public TransferOptions setThreadCount(int threadCount) {
            this.threadCount = threadCount;
            return this;
        }
        
        public long getChunkSize() {
            return chunkSize;
        }
        
        public TransferOptions setChunkSize(long chunkSize) {
            this.chunkSize = chunkSize;
            return this;
        }
        
        public boolean isUseDirectBuffers() {
            return useDirectBuffers;
        }
        
        public TransferOptions setUseDirectBuffers(boolean useDirectBuffers) {
            this.useDirectBuffers = useDirectBuffers;
            return this;
        }
    }
    
    /**
     * Transfer statistics class
     */
    public static class TransferStats {
        private final long bytesTransferred;
        private final double transferTimeSec;
        private final double transferRateMBps;
        
        public TransferStats(long bytesTransferred, double transferTimeSec, double transferRateMBps) {
            this.bytesTransferred = bytesTransferred;
            this.transferTimeSec = transferTimeSec;
            this.transferRateMBps = transferRateMBps;
        }
        
        public long getBytesTransferred() {
            return bytesTransferred;
        }
        
        public double getTransferTimeSec() {
            return transferTimeSec;
        }
        
        public double getTransferRateMBps() {
            return transferRateMBps;
        }
        
        @Override
        public String toString() {
            return String.format(
                "Transferred %d bytes (%.2f MB) in %.2f seconds at %.2f MB/s",
                bytesTransferred,
                bytesTransferred / 1024.0 / 1024.0,
                transferTimeSec,
                transferRateMBps
            );
        }
    }
} 