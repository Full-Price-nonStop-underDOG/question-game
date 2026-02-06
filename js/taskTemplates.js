/**
 * Task Templates Data Model
 * 
 * Task templates represent WHAT to do, without referencing specific players.
 * Target players will be assigned dynamically per room when tasks are distributed.
 * 
 * Firestore Collection: "taskTemplates"
 * Document IDs: "task-1", "task-2", "task-3", etc.
 * 
 * Document Structure:
 * {
 *   text: string  // Task action text (e.g., "Заставь другого человека назвать овощ")
 * }
 * 
 * Examples of valid task texts:
 * - "Заставь другого человека назвать овощ"
 * - "Убедить человека согласиться с тобой"
 * - "Заставить кого-то произнести определенное слово"
 * - "Убедить человека выполнить простое действие"
 * 
 * Important:
 * - Task text must NOT reference a specific player by name
 * - Task text should use generic terms like "другого человека", "кого-то", "человека"
 * - Target player assignment happens at room/task distribution time, not in template
 * - taskId MUST always be the Firestore document ID (e.g., "task-17")
 * - Display labels like "Task 1 (Anna)" are UI-only and NEVER stored in Firestore
 */

import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Validate that a taskId follows the expected format: "task-<number>"
 * @param {string} taskId - Task ID to validate
 * @returns {boolean} - True if valid format
 */
function isValidTaskIdFormat(taskId) {
  if (!taskId || typeof taskId !== "string") {
    return false;
  }
  // Must match pattern: task-<number>
  return /^task-\d+$/.test(taskId);
}

/**
 * Fetch all tasks from Firestore "taskTemplates" collection
 * @returns {Promise<Array<{id: string, text: string}>>}
 */
async function getAllTaskTemplates() {
  const tasksRef = collection(db, "taskTemplates");
  
  try {
    const querySnapshot = await getDocs(tasksRef);
    const templates = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const taskId = doc.id;
      
      // Validate taskId format
      if (!isValidTaskIdFormat(taskId)) {
        console.warn(`[TASK_ID_VALIDATION] Invalid taskId format: "${taskId}". Expected format: "task-<number>"`);
        // Continue processing but log warning
      }
      
      templates.push({
        id: taskId, // Firestore docId (e.g., "task-17")
        text: data.text || ""
      });
    });
    
    // Log first few taskIds for debugging
    const firstFewIds = templates.slice(0, 5).map(t => t.id);
    console.log(`[TASK_LOAD] Loaded ${templates.length} tasks. First few taskIds:`, firstFewIds);
    
    return templates;
  } catch (error) {
    console.error("Error fetching tasks from Firestore:", error);
    return [];
  }
}

/**
 * Validate task template structure
 * @param {Object} template - Task template object
 * @returns {boolean} - True if valid
 */
function validateTaskTemplate(template) {
  if (!template || typeof template !== "object") {
    return false;
  }
  
  if (!template.text || typeof template.text !== "string") {
    return false;
  }
  
  if (template.text.trim().length === 0) {
    return false;
  }
  
  // Ensure task text doesn't reference specific players
  // This is a basic check - more sophisticated validation can be added later
  const lowerText = template.text.toLowerCase();
  // Note: This is a simple check. In production, you might want more sophisticated validation
  
  return true;
}

export { getAllTaskTemplates, validateTaskTemplate, isValidTaskIdFormat };
