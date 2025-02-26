/**
 * Directed Acyclic Graph for managing the task dependencies
 */
export class DAG {
  private graph: Map<string, string[]>;
  private reverseGraph: Map<string, string[]>; // To track reverse dependencies

  constructor() {
    this.graph = new Map();
    this.reverseGraph = new Map();
  }

  /**
   * Adds a dependency where `dependent` depends on `dependency`
   * Meaning: "A depends on B" translates to B → A in the DAG.
   */
  addDependency(dependency: string, dependent: string): void {
    if (!this.graph.has(dependency)) {
      this.graph.set(dependency, []);
    }
    this.graph.get(dependency).push(dependent);

    // Ensure dependent node exists in the graph
    if (!this.graph.has(dependent)) {
      this.graph.set(dependent, []);
    }

    // Track reverse dependencies
    if (!this.reverseGraph.has(dependent)) {
      this.reverseGraph.set(dependent, []);
    }
    this.reverseGraph.get(dependent).push(dependency);
  }

  /**
   * Gets all nodes that directly or indirectly depend on the given node.
   */
  public getAllDependents(startNode: string): Set<string> {
    if (!this.graph.has(startNode)) {
      return new Set();
    }

    const dependents = new Set<string>();
    const stack = [startNode];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!dependents.has(node)) {
        dependents.add(node);
        for (const child of this.graph.get(node) || []) {
          stack.push(child);
        }
      }
    }

    dependents.delete(startNode); // remove the start node itself
    return dependents;
  }

  /**
   * Finds all prerequisite nodes for a given starting node (traverse reverse dependencies)
   */
  public getAllDependencies(startNode: string): Set<string> {
    const requiredNodes = new Set<string>();
    const stack = [startNode];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!requiredNodes.has(node)) {
        requiredNodes.add(node);
        for (const parent of this.reverseGraph.get(node) || []) {
          stack.push(parent);
        }
      }
    }

    requiredNodes.delete(startNode); // remove the start node itself
    return requiredNodes;
  }

  /**
   * Topological sorting from a given start node (including dependencies)
   */
  topologicalSortFrom(startNode: string): string[] {
    if (!this.graph.has(startNode)) {
      return [];
    }

    // Get all dependencies that must be executed before startNode
    const relevantNodes = this.getAllDependencies(startNode);
    relevantNodes.add(startNode); // Include the starting node

    const visited = new Set<string>();
    const stack: string[] = [];

    const dfs = (node: string): void => {
      if (visited.has(node) || !relevantNodes.has(node)) return;
      visited.add(node);
      for (const neighbor of this.graph.get(node) || []) {
        dfs(neighbor);
      }
      stack.push(node);
    };

    for (const node of relevantNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return stack.reverse(); // Return in topological order
  }

  /**
   * Full DAG topological sorting
   */
  topologicalSort(): string[] {
    const visited: Set<string> = new Set();
    const stack: string[] = [];

    const dfs = (node: string): void => {
      if (visited.has(node)) return;
      visited.add(node);
      for (const neighbor of this.graph.get(node) || []) {
        dfs(neighbor);
      }
      stack.push(node);
    };

    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return stack.reverse(); // Return in topological order
  }
}
