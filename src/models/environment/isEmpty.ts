import getElasticsearch from "../../persistence/elasticsearch";

const es: any = getElasticsearch();

interface Options {
  projectId: string;
  environmentId: string;
}

export default async function(opts: Options): Promise<boolean> {
  return await new Promise<boolean>((resolve, reject) => {
    const aliasName = `retraced.${opts.projectId}.${opts.environmentId}`;
    es.cat.aliases({ format: "json", name: aliasName }, (err, resp) => {
      if (err) {
        reject(err);
        return;
      }

      if (!Array.isArray(resp) || resp.length === 0) {
        resolve(true);
        return;
      }

      // See if index has any items in it.
      es.raw.count({ index: aliasName }, (err2, resp2) => {
        if (err2) {
          reject(err2);
          return;
        }

        resolve(resp2.count === 0);
      });
    });
  });
}
