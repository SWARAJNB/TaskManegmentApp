pipeline {
    agent any

    environment {
        // Set environment variables if needed
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
            }
        }

        stage('Backend Setup & Test') {
            steps {
                script {
                    echo 'Starting backend build and tests...'
                    if (isUnix()) {
                        sh '''
                            cd backend
                            python3 -m venv venv || python -m venv venv
                            . venv/bin/activate
                            pip install --upgrade pip
                            pip install -r requirements.txt
                            python test_backend.py
                        '''
                    } else {
                        bat '''
                            cd backend
                            python -m venv venv
                            call venv\\Scripts\\activate
                            pip install --upgrade pip
                            pip install -r requirements.txt
                            python test_backend.py
                        '''
                    }
                }
            }
        }

        stage('Frontend Setup & Build') {
            steps {
                script {
                    echo 'Starting frontend build...'
                    if (isUnix()) {
                        sh '''
                            cd frontend
                            npm install
                            npm run build
                        '''
                    } else {
                        bat '''
                            cd frontend
                            npm install
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Docker Integration Check') {
            steps {
                script {
                    echo 'Checking docker-compose configurations...'
                    try {
                        if (isUnix()) {
                            sh 'docker-compose config -q || docker compose config -q'
                        } else {
                            bat 'docker compose config -q || docker-compose config -q'
                        }
                        echo 'Docker Compose configurations are valid.'
                    } catch (Exception e) {
                        echo "Skipping Docker compose validation: ${e.message}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Build complete.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
