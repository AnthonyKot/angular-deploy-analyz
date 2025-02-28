import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AnalysisItem, SeverityLevel, CategoryType } from '../models/analysis.model';

@Injectable({
  providedIn: 'root'
})
export class LlmMockService {
  
  constructor() { }

  // Mock response for the initial YAML analysis
  analyzeYaml(yaml: string): Observable<any> {
    // Simulate API delay
    return of(this.generateMockAnalysisResponse(yaml)).pipe(
      delay(1200)  // Simulate a realistic API response time
    );
  }

  // Mock response for a specific issue recommendation
  getFixRecommendation(issueId: string, yaml: string): Observable<any> {
    // Simulate API delay
    return of(this.generateMockFixRecommendation(issueId, yaml)).pipe(
      delay(800)  // Simulate a realistic API response time
    );
  }
  
  // Apply a fix to the YAML content
  applyFixToYaml(issueId: string, yaml: string): Observable<string> {
    // Simulate API delay
    return of(this.generateFixedYaml(issueId, yaml)).pipe(
      delay(1200)  // Simulate a realistic API response time
    );
  }
  
  // Apply multiple fixes to the YAML content
  applyAllFixes(issueIds: string[], yaml: string): Observable<string> {
    // Apply each fix sequentially
    let updatedYaml = yaml;
    for (const issueId of issueIds) {
      updatedYaml = this.generateFixedYaml(issueId, updatedYaml);
    }
    
    // Simulate API delay
    return of(updatedYaml).pipe(
      delay(2000)  // Simulate a longer API response time for multiple fixes
    );
  }

  private generateMockAnalysisResponse(yaml: string): any {
    const hasResourceLimits = yaml.includes('limits:');
    const hasNetworkPolicy = yaml.includes('kind: NetworkPolicy') || yaml.includes('networkPolicy');
    const hasLivenessProbe = yaml.includes('livenessProbe');
    const hasReadinessProbe = yaml.includes('readinessProbe');
    const usesLatestTag = yaml.includes(':latest');
    const hasPodAntiAffinity = yaml.includes('podAntiAffinity');
    const hasSecurityContext = yaml.includes('securityContext');

    const analysisItems: AnalysisItem[] = [];
    let securityScore = 80;
    let reliabilityScore = 70;
    let performanceScore = 75;
    let scalabilityScore = 65;
    let costScore = 60;

    // Resource limits check
    if (!hasResourceLimits) {
      analysisItems.push({
        id: 'missing-resource-limits',
        title: 'Missing resource limits for containers',
        type: 'danger',
        severity: 'high',
        category: 'reliability',
        details: 'Containers without resource limits can consume unlimited CPU and memory, potentially causing resource contention issues and affecting other workloads on the cluster.',
        recommendation: 'Add CPU and memory limits to all containers to ensure predictable performance and avoid resource starvation.'
      });
      reliabilityScore -= 20;
      costScore -= 25;
    }

    // Network policy check
    if (!hasNetworkPolicy) {
      analysisItems.push({
        id: 'missing-network-policy',
        title: 'No network policies defined',
        type: 'warning',
        severity: 'medium',
        category: 'security',
        details: 'Without network policies, pods can communicate with any other pod in the cluster, potentially allowing unauthorized access to sensitive services.',
        recommendation: 'Implement network policies to restrict pod-to-pod communication and improve overall security posture.'
      });
      securityScore -= 15;
    }

    // Liveness probe check
    if (!hasLivenessProbe) {
      analysisItems.push({
        id: 'missing-liveness-probe',
        title: 'Missing liveness probe',
        type: 'warning',
        severity: 'medium',
        category: 'reliability',
        details: 'Without a liveness probe, Kubernetes cannot determine if your application is running properly and cannot automatically restart failed containers.',
        recommendation: 'Add a liveness probe that checks if your application is functioning correctly.'
      });
      reliabilityScore -= 15;
    }

    // Readiness probe check
    if (!hasReadinessProbe) {
      analysisItems.push({
        id: 'missing-readiness-probe',
        title: 'Missing readiness probe',
        type: 'warning',
        severity: 'medium',
        category: 'reliability',
        details: 'Without a readiness probe, traffic may be sent to pods that are not yet ready to handle requests, leading to errors and poor user experience.',
        recommendation: 'Add a readiness probe that verifies your application is ready to receive traffic.'
      });
      reliabilityScore -= 10;
      performanceScore -= 10;
    }

    // Latest tag check
    if (usesLatestTag) {
      analysisItems.push({
        id: 'using-latest-tag',
        title: 'Using the \'latest\' tag for container images',
        type: 'danger',
        severity: 'high',
        category: 'reliability',
        details: 'Using the \'latest\' tag can lead to unexpected changes in your deployment when the underlying image is updated, making your deployments unpredictable.',
        recommendation: 'Use specific version tags for container images to ensure reproducible deployments.'
      });
      reliabilityScore -= 20;
    }

    // Pod anti-affinity check
    if (!hasPodAntiAffinity) {
      analysisItems.push({
        id: 'missing-pod-anti-affinity',
        title: 'Missing pod anti-affinity rules',
        type: 'warning',
        severity: 'low',
        category: 'reliability',
        details: 'Without pod anti-affinity, multiple replicas of your application could be scheduled on the same node, reducing availability if that node fails.',
        recommendation: 'Add pod anti-affinity rules to spread replicas across different nodes for improved availability.'
      });
      reliabilityScore -= 5;
      scalabilityScore -= 10;
    }

    // Security context check
    if (!hasSecurityContext) {
      analysisItems.push({
        id: 'missing-security-context',
        title: 'Missing security context',
        type: 'warning',
        severity: 'high',
        category: 'security',
        details: 'Without a security context, containers may run with excessive privileges, potentially allowing attackers to escape the container and access the host system.',
        recommendation: 'Add a security context with runAsNonRoot: true and allowPrivilegeEscalation: false to enhance container security.'
      });
      securityScore -= 20;
    }

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (securityScore * 0.3) + 
      (reliabilityScore * 0.3) + 
      (performanceScore * 0.15) + 
      (scalabilityScore * 0.15) + 
      (costScore * 0.1)
    );

    return {
      analysisItems: analysisItems,
      scoreBreakdown: {
        security: securityScore,
        reliability: reliabilityScore,
        performance: performanceScore,
        scalability: scalabilityScore,
        cost: costScore
      },
      overallScore: overallScore
    };
  }

  private generateMockFixRecommendation(issueId: string, yaml: string): any {
    const recommendations = {
      'missing-resource-limits': {
        detailedRecommendation: 'Resource limits are essential for maintaining stability in a Kubernetes cluster. Without limits, a container can use all available CPU and memory on a node, potentially causing issues for other workloads. Best practice is to set both requests and limits for CPU and memory resources.',
        fixExample: `containers:
  - name: nginx
    image: nginx:1.21.0
    resources:
      requests:
        memory: "64Mi"
        cpu: "100m"
      limits:
        memory: "128Mi"
        cpu: "200m"`,
        additionalNotes: 'Start with conservative limits and adjust based on actual usage patterns. Monitor resource usage over time to optimize these values. Remember that setting limits too low can cause throttling or OOM kills.',
        highlightAnchor: 'containers:'
      },
      'missing-network-policy': {
        detailedRecommendation: 'Network policies act as a firewall for your Kubernetes pods, controlling which pods can communicate with each other. By default, all pods can communicate with all other pods, which is often too permissive for secure environments.',
        fixExample: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: your-namespace
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress`,
        additionalNotes: 'This example creates a "default deny all" policy. You should then create additional policies that specifically allow the traffic you need. Network policies use label selectors to identify pods they apply to.',
        highlightAnchor: 'kind: Deployment'
      },
      'missing-liveness-probe': {
        detailedRecommendation: 'Liveness probes help Kubernetes determine if your application is healthy. If the probe fails, Kubernetes will restart the container automatically, which can help recover from application deadlocks or other issues that don\'t crash the process.',
        fixExample: `containers:
  - name: your-container
    image: your-image:tag
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3`,
        additionalNotes: 'Adjust the path, port, and timing parameters to match your application. The probe should check a lightweight endpoint that verifies your application is functioning correctly without causing significant load.',
        highlightAnchor: 'name: your-container'
      },
      'missing-readiness-probe': {
        detailedRecommendation: 'Readiness probes determine if a pod should receive traffic. Unlike liveness probes, when a readiness probe fails, the pod isn\'t restarted but is removed from service endpoints until it passes the probe again.',
        fixExample: `containers:
  - name: your-container
    image: your-image:tag
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds: 1
      successThreshold: 1
      failureThreshold: 3`,
        additionalNotes: 'The readiness endpoint should check if your application is fully initialized and ready to handle requests. This might include checking database connections, caches, or other dependencies.',
        highlightAnchor: 'image: your-image'
      },
      'using-latest-tag': {
        detailedRecommendation: 'Using specific version tags ensures that your deployments are reproducible and consistent. The "latest" tag can point to different image versions over time, leading to unexpected changes in behavior.',
        fixExample: `containers:
  - name: nginx
    image: nginx:1.21.3  # Using a specific version instead of :latest`,
        additionalNotes: 'Consider implementing a CI/CD pipeline that automatically updates version tags in your manifests when new versions are released and tested. This gives you control over when updates happen while still staying current.',
        highlightAnchor: 'image: nginx:latest'
      },
      'missing-pod-anti-affinity': {
        detailedRecommendation: 'Pod anti-affinity helps distribute your application\'s replicas across different nodes, improving availability in case of node failures. Without it, all replicas might end up on the same node.',
        fixExample: `spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - your-app-name
          topologyKey: "kubernetes.io/hostname"`,
        additionalNotes: 'Use "preferredDuringSchedulingIgnoredDuringExecution" if you want Kubernetes to try to spread pods across nodes but still schedule them if it cannot. Use "requiredDuringSchedulingIgnoredDuringExecution" if you want to enforce the rule strictly.',
        highlightAnchor: 'spec:'
      },
      'missing-security-context': {
        detailedRecommendation: 'Security contexts define privilege and access control settings for pods and containers. Running containers as non-root users with minimal privileges is a security best practice to reduce the attack surface.',
        fixExample: `spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: your-container
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
          - ALL`,
        additionalNotes: 'Many containers are designed to run as root by default. You may need to modify your container images or their startup scripts to run as a non-root user. The specific user ID (1000 in this example) should be appropriate for your application.',
        highlightAnchor: 'containers:'
      }
    };

    return recommendations[issueId] || {
      detailedRecommendation: 'No specific recommendations available for this issue.',
      fixExample: 'Example code not available.',
      additionalNotes: 'Please consult Kubernetes documentation for best practices.',
      highlightAnchor: 'spec:'
    };
  }
  
  // Generate a fixed version of the YAML based on the issue ID
  private generateFixedYaml(issueId: string, yaml: string): string {
    switch (issueId) {
      case 'missing-resource-limits':
        // Add resource limits to the first container found
        if (yaml.includes('containers:')) {
          // Check if we can find a container block
          const containerMatch = yaml.match(/containers:\s*\n\s*-\s*name:\s*([^\n]+)/);
          if (containerMatch) {
            const containerName = containerMatch[1].trim();
            const resourceBlock = `
    resources:
      requests:
        memory: "64Mi"
        cpu: "100m"
      limits:
        memory: "128Mi"
        cpu: "200m"`;
            
            // Find where to insert the resource limits
            const insertPoint = yaml.indexOf('\n', yaml.indexOf(`name: ${containerName}`));
            if (insertPoint !== -1) {
              return yaml.slice(0, insertPoint) + resourceBlock + yaml.slice(insertPoint);
            }
          }
        }
        break;
        
      case 'missing-network-policy':
        // Add a network policy at the end of the YAML
        const networkPolicy = `
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress`;
        
        return yaml + networkPolicy;
        
      case 'missing-liveness-probe':
        // Add a liveness probe to the first container
        if (yaml.includes('containers:')) {
          const containerMatch = yaml.match(/containers:\s*\n\s*-\s*name:\s*([^\n]+)/);
          if (containerMatch) {
            const containerName = containerMatch[1].trim();
            const livenessProbe = `
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3`;
            
            // Find where to insert the liveness probe
            const insertPoint = yaml.indexOf('\n', yaml.indexOf(`name: ${containerName}`));
            if (insertPoint !== -1) {
              return yaml.slice(0, insertPoint) + livenessProbe + yaml.slice(insertPoint);
            }
          }
        }
        break;
        
      case 'missing-readiness-probe':
        // Add a readiness probe to the first container
        if (yaml.includes('containers:')) {
          const containerMatch = yaml.match(/containers:\s*\n\s*-\s*name:\s*([^\n]+)/);
          if (containerMatch) {
            const containerName = containerMatch[1].trim();
            const readinessProbe = `
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds: 1
      successThreshold: 1
      failureThreshold: 3`;
            
            // Find where to insert the readiness probe
            const insertPoint = yaml.indexOf('\n', yaml.indexOf(`name: ${containerName}`));
            if (insertPoint !== -1) {
              return yaml.slice(0, insertPoint) + readinessProbe + yaml.slice(insertPoint);
            }
          }
        }
        break;
        
      case 'using-latest-tag':
        // Replace ':latest' with a specific version tag
        return yaml.replace(/image:\s*([^:]+):latest/g, 'image: $1:1.21.3');
        
      case 'missing-pod-anti-affinity':
        // Add pod anti-affinity to the deployment spec
        if (yaml.includes('spec:')) {
          // Try to find the app name from the yaml
          let appName = 'app-name';
          const appMatch = yaml.match(/app:\s*([^\n]+)/);
          if (appMatch) {
            appName = appMatch[1].trim();
          }
          
          const antiAffinity = `
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - ${appName}
          topologyKey: "kubernetes.io/hostname"`;
          
          // Find the spec section
          const specMatch = yaml.match(/spec:\s*\n/);
          if (specMatch) {
            const specIndex = yaml.indexOf(specMatch[0]) + specMatch[0].length;
            return yaml.slice(0, specIndex) + antiAffinity + yaml.slice(specIndex);
          }
        }
        break;
        
      case 'missing-security-context':
        // Add security context to the pod and container
        if (yaml.includes('spec:')) {
          const securityContext = `
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000`;
          
          // Find the spec section
          const specMatch = yaml.match(/spec:\s*\n/);
          if (specMatch) {
            const specIndex = yaml.indexOf(specMatch[0]) + specMatch[0].length;
            
            // Also add container security context
            let updatedYaml = yaml.slice(0, specIndex) + securityContext + yaml.slice(specIndex);
            
            // Find containers section
            const containerMatch = updatedYaml.match(/containers:\s*\n\s*-\s*name:\s*([^\n]+)/);
            if (containerMatch) {
              const containerName = containerMatch[1].trim();
              const containerSecurityContext = `
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL`;
              
              // Insert container security context
              const insertPoint = updatedYaml.indexOf('\n', updatedYaml.indexOf(`name: ${containerName}`));
              if (insertPoint !== -1) {
                return updatedYaml.slice(0, insertPoint) + containerSecurityContext + updatedYaml.slice(insertPoint);
              }
            }
            
            return updatedYaml;
          }
        }
        break;
    }
    
    // If we couldn't apply a specific fix, return the original YAML
    return yaml;
  }
}