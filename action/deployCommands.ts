import { loadEnvironmentVariables, setDefaultLogLevel } from "../functions";
import { CommandsHandler } from "../handlers/Commands";

loadEnvironmentVariables();
setDefaultLogLevel();

const commandsHandler = new CommandsHandler();
void commandsHandler.deployCommands();
