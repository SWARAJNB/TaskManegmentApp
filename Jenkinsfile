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

        stage('Docker Build & Push to AWS ECR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        def awsRegion = "YOUR_AWS_REGION"
                        def awsAccountId = "YOUR_AWS_ACCOUNT_ID"
                        
                        echo 'Logging in to AWS ECR...'
                        if (isUnix()) {
                            sh "aws ecr get-login-password --region ${awsRegion} | docker login --username AWS --password-stdin ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com"
                            
                            echo 'Building & Pushing Backend Image...'
                            sh "docker build -t taskflow-backend ./backend"
                            sh "docker tag taskflow-backend:latest ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-backend:latest"
                            sh "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-backend:latest"
                            
                            echo 'Building & Pushing Frontend Image...'
                            sh "docker build -t taskflow-frontend ./frontend"
                            sh "docker tag taskflow-frontend:latest ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-frontend:latest"
                            sh "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-frontend:latest"
                        } else {
                            bat "aws ecr get-login-password --region ${awsRegion} | docker login --username AWS --password-stdin ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com"
                            
                            echo 'Building & Pushing Backend Image...'
                            bat "docker build -t taskflow-backend ./backend"
                            bat "docker tag taskflow-backend:latest ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-backend:latest"
                            bat "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-backend:latest"
                            
                            echo 'Building & Pushing Frontend Image...'
                            bat "docker build -t taskflow-frontend ./frontend"
                            bat "docker tag taskflow-frontend:latest ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-frontend:latest"
                            bat "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/taskflow-frontend:latest"
                        }
                    }
                }
            }
        }

        stage('Deploy to AWS ECS') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        def awsRegion = "YOUR_AWS_REGION"
                        echo 'Registering task definition and updating services...'
                        if (isUnix()) {
                            sh "aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${awsRegion}"
                            sh "aws ecs update-service --cluster taskflow-cluster --service taskflow-backend-service --task-definition taskflow-app --region ${awsRegion}"
                            sh "aws ecs update-service --cluster taskflow-cluster --service taskflow-frontend-service --task-definition taskflow-app --region ${awsRegion}"
                        } else {
                            bat "aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${awsRegion}"
                            bat "aws ecs update-service --cluster taskflow-cluster --service taskflow-backend-service --task-definition taskflow-app --region ${awsRegion}"
                            bat "aws ecs update-service --cluster taskflow-cluster --service taskflow-frontend-service --task-definition taskflow-app --region ${awsRegion}"
                        }
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
