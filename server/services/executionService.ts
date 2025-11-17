import logger from '../utils/logger';

/**
 * Execution Management Service
 * Handles cancellation, queue management, and execution tracking
 */
export class ExecutionService {
  private static runningExecutions = new Map<string, AbortController>();
  private static executionQueue: { id: string; timestamp: Date }[] = [];
  private static maxConcurrent = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '5');
  private static activeExecutions = 0;

  /**
   * Register a running execution with an abort controller
   */
  static registerExecution(executionId: string, controller: AbortController) {
    this.runningExecutions.set(executionId, controller);
    this.executionQueue.push({ id: executionId, timestamp: new Date() });
    this.activeExecutions++;
  }

  /**
   * Unregister a completed execution
   */
  static unregisterExecution(executionId: string) {
    this.runningExecutions.delete(executionId);
    this.executionQueue = this.executionQueue.filter(e => e.id !== executionId);
    this.activeExecutions = Math.max(0, this.activeExecutions - 1);
  }

  /**
   * Cancel a running execution
   */
  static cancelExecution(executionId: string): { success: boolean; message: string } {
    const controller = this.runningExecutions.get(executionId);
    if (!controller) {
      return { success: false, message: 'Execution not found or already completed' };
    }

    controller.abort();
    this.unregisterExecution(executionId);
    logger.info('Execution cancelled', { executionId });
    return { success: true, message: 'Execution cancelled successfully' };
  }

  /**
   * Check if a new execution can start
   */
  static canStartExecution(): boolean {
    return this.activeExecutions < this.maxConcurrent;
  }

  /**
   * Get execution queue status
   */
  static getQueueStatus() {
    return {
      activeExecutions: this.activeExecutions,
      maxConcurrent: this.maxConcurrent,
      queuedCount: this.executionQueue.length,
      queue: this.executionQueue
    };
  }
}
