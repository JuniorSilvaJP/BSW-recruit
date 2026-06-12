const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor web iniciado na porta ${PORT}`);
});
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("clientReady", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.find(
    r => r.name === "Recruta"
  );

  if (role) {
    await member.roles.add(role);
  }

  const canal = member.guild.channels.cache.find(
    c => c.name === "recrutamento"
  );

  if (canal) {
    canal.send(
      `👋 Bem-vindo à Guilda Black Shadow ${member}!\n\nDigite **!nick SeuNick** para se registrar.`
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // PING
  if (message.content === "!ping") {
    return message.reply("Pong!");
  }

  // REGISTRO DE NICK
  if (message.content.startsWith("!nick")) {
    const nick = message.content.split(" ").slice(1).join(" ");

    if (!nick) {
      return message.reply("❌ Use: !nick SeuNome");
    }

    await message.member.setNickname(nick).catch(() => {});

    const log = message.guild.channels.cache.find(
      c => c.name === "logs-recrutamento"
    );

    if (log) {
      log.send(
        `📥 Novo recrutamento\nUsuário: ${message.author.tag}\nNick: ${nick}`
      );
    }

    return message.reply(
      "✅ Nick registrado! Aguarde aprovação."
    );
  }

  // APROVAÇÃO
 if (message.content.startsWith("!aprovar")) {

  const cargosPermitidos = [
    "Lider",
    "Comandante",
    "Capitão",
    "Sargento"
  ];

  const podeAprovar = message.member.roles.cache.some(role =>
    cargosPermitidos.includes(role.name)
  );

  if (!podeAprovar) {
    return message.reply(
      "❌ Apenas Lider, Comandante, Capitão ou Sargento podem aprovar recrutas."
    );
  }

  const membro = message.mentions.members.first();

  if (!membro) {
    return message.reply("❌ Use: !aprovar @usuario");
  }

  const recrutaRole = message.guild.roles.cache.find(
    r => r.name === "Recruta"
  );

  const guardaRole = message.guild.roles.cache.find(
    r => r.name === "Guarda"
  );

  if (recrutaRole) {
    await membro.roles.remove(recrutaRole).catch(console.error);
  }

  if (guardaRole) {
    await membro.roles.add(guardaRole).catch(console.error);
  }

  try {
    await membro.send(
      `🎉 Parabéns!

Seu recrutamento para a Black Shadow foi aprovado.

Você recebeu o cargo Guarda.

Seja bem-vindo à guilda!`
    );
  } catch (err) {
    console.log("Não foi possível enviar DM.");
  }

  const log = message.guild.channels.cache.find(
    c => c.name === "logs-recrutamento"
  );

  if (log) {
    await log.send(
      `✅ ${membro.user.tag} foi aprovado por ${message.author.tag} e recebeu o cargo Guarda`
    );
  }

  const recrutamento = message.guild.channels.cache.find(
    c => c.name === "recrutamento"
  );

  if (recrutamento) {
    const msgs = await recrutamento.messages.fetch();

    for (const [, msg] of msgs) {
      await msg.delete().catch(() => {});
    }

    await recrutamento.send(
      "📢 Canal limpo. Aguardando novos recrutas."
    );
  }

  return message.reply(
    `✅ ${membro.user.tag} aprovado com sucesso e promovido a Guarda.`
  );
}
});

client.login(process.env.TOKEN);
