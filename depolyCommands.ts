import { loadEnvironmentVariables } from './functions';
import { CommandsHandler } from './handlers/Commands';

loadEnvironmentVariables();

const commandsHandler = new CommandsHandler();
void commandsHandler.depolyCommands();