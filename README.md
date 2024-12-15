# Diagnosis ( Student Diagnosis Page )

### To start the project, run the following command:
```npm start```

The application will be available at ```localhost:3000``` by default.

---
### Build Commands

To build the Docker image, use the following command:

```docker.build -t diagnosis:test -f Dockerfile . ```

Push the image to ECS:

```ecs-utils push diagnosis diagnosis:test```

Deploy to ECS:

```ecs-utils deploy diagnosis <TAG_NAME>```