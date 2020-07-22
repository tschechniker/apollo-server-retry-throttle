# apollo-server-retry

[Demo in codesandbox.io](https://codesandbox.io/s/apollo-server-retry-lphmd) of Retry-mechanism in apollo-server

Run tests via terminal:

```
npm test
```

Try executing following query in browser and see requests in console (terminal)

```
{
  character {
    name
    height
    films {
      title
      episode_id
      characters {
        name
      }
    }
  }
}
```
