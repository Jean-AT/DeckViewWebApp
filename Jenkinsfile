pipeline {
  agent any

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Dependency Audit') {
      steps {
        sh 'npm audit --audit-level=high'
      }
    }
    stage('Lint & Type Check') {
      steps {
        sh 'npm run lint && npm run typecheck'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Docker Build') {
      steps {
        sh 'docker build -t deckview-webapp .'
      }
    }
    stage('Push & Deploy') {
      steps {
        echo 'Push a registry y deploy al ambiente destino'
      }
    }
  }
}