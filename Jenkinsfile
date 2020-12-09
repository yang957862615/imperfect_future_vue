pipeline {

  environment {
      DOCKER_CREDENTIAL_ID = 'aliyun-id'
      GITEE_CREDENTIAL_ID = 'gitee-id'
      KUBECONFIG_CREDENTIAL_ID = 'future-kubeconfig'
      REGISTRY = 'registry.cn-shenzhen.aliyuncs.com'
      REGISTRY_PREFIX = 'imperfect-future'
      DOCKERHUB_NAMESPACE = 'notthatbad'
      GITEE_ACCOUNT = 'JoeGreenlove'
      SONAR_CREDENTIAL_ID = 'sonar-token'
  }

   parameters {
        string(name:'TAG_NAME',defaultValue: 'v0.0.1',description:'tag版本号')
        string(name:'BRANCH_NAME',defaultValue: 'master',description:'git分支')
    }

  stages {
    stage('拉取最新代码') {
      steps {
        git(url: 'https://gitee.com/JoeGreenlove/imperfect_future_vue.git', credentialsId: 'gitee-id', branch: 'master', changelog: true, poll: false)
      }
    }

    stage ('镜像构建 & 推送') {
      steps {
          container ('maven') {
              sh 'echo 开始 $APP_NAME 模块镜像构建并推送'
              sh 'cd $APP_NAME && docker build --no-cache -f Dockerfile -t $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:SNAPSHOT-$BRANCH_NAME-$BUILD_NUMBER .'
              withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
                  sh 'echo "$DOCKER_PASSWORD" | docker login $REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
                  sh 'docker tag  $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:SNAPSHOT-$BRANCH_NAME-$BUILD_NUMBER $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:latest'
                  sh 'docker push  $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:latest'
              }
          }
      }
    }

    stage('部署到k8s') {
      steps {
        input(id: "deploy-to-dev-$APP_NAME ", message: "是否将 $APP_NAME 部署到集群中?")
        kubernetesDeploy(configs: "$APP_NAME/deploy/**", enableConfigSubstitution: true, kubeconfigId: "$KUBECONFIG_CREDENTIAL_ID")
      }
    }

    stage('发布版本'){
      when{
        expression{
          return params.TAG_NAME =~ /v.*/
        }
      }
      steps {
          container ('maven') {
            input(id: 'release-image-with-tag', message: "发布 $TAG_NAME 版本镜像吗?")
            sh 'docker tag  $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:SNAPSHOT-$BRANCH_NAME-$BUILD_NUMBER $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:$TAG_NAME'
            sh 'docker push  $REGISTRY/$DOCKERHUB_NAMESPACE/$REGISTRY_PREFIX-$APP_NAME:$TAG_NAME '
            withCredentials([usernamePassword(credentialsId: "$GITEE_CREDENTIAL_ID", passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                sh 'git config --global user.email "957862615@qq.com" '
                sh 'git config --global user.name "JoeGreenlove" '
                sh 'git tag -a $APP_NAME-$TAG_NAME -m "$TAG_NAME" '
                sh 'git push http://$GIT_USERNAME:$GIT_PASSWORD@gitee.com/$GITEE_ACCOUNT/imperfect_future_vue.git --tags --ipv4'
            }
       }
      }
    }
  }
}
