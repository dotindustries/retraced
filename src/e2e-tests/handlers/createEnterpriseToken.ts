import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { createEnterpriseToken } from "../../handlers/createEnterpriseToken";
import getPgPool from "../../persistence/pg";
import { AdminTokenStore } from "../../models/admin_token/store";
import create from "../../models/api_token/create";

@suite class CreateEnterpriseToken {
    @test public async "CreateEnterpriseToken#createEnterpriseToken()"() {
        const pool = getPgPool();
        try {
            await cleanup(pool);
            await setup(pool);
            const result = await createEnterpriseToken(`token=test`, "test", "test", {
                display_name: "test",
            });
            expect(result.display_name).to.equal("test");
        } catch (ex) {
            console.log(ex);
        } finally {
            await cleanup(pool);
        }
    }
}
async function setup(pool) {
    await pool.query("INSERT INTO project (id, name) VALUES ($1, $2)", ["test", "test"]);
    await pool.query("INSERT INTO environment (id, name, project_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    await pool.query("INSERT INTO retraceduser (id, email) VALUES ($1, $2)", ["test", "test@test.com"]);
    await pool.query("INSERT INTO environmentuser (user_id, environment_id, email_token) VALUES ($1, $2, $3)", ["test", "test", "dummytoken"]);
    await pool.query("INSERT INTO projectuser (id, project_id, user_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    const res = await AdminTokenStore.default().createAdminToken("test");
    await create("test", "test", {
        name: "test",
        disabled: false,
    }, undefined, "test");
    return res;
}

async function cleanup(pool) {
    await pool.query(`DELETE FROM admin_token WHERE user_id=$1`, ["test"]);
    await pool.query(`DELETE FROM environmentuser WHERE user_id=$1`, ["test"]);
    await pool.query(`DELETE FROM environment WHERE name=$1`, ["test"]);
    await pool.query(`DELETE FROM project WHERE name=$1 OR name=$2`, ["test", "test1"]);
    await pool.query(`DELETE FROM projectuser WHERE project_id=$1`, ["test"]);
    await pool.query(`DELETE FROM token WHERE environment_id=$1`, ["test"]);
    await pool.query(`DELETE FROM retraceduser WHERE email=$1`, ["test@test.com"]);
    await pool.query(`DELETE FROM eitapi_token WHERE environment_id=$1`, ["test"]);
}

export default CreateEnterpriseToken;
