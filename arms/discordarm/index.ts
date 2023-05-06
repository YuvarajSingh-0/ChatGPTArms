import { ChatGPTArms } from "../chatgptarms";

export class DiscordArm {
    public async processConversation(convo) {
        const step = await this.amINeeded(convo);
        if (step) {
            if (step == 1) {
                return this.sendDiscord(convo);
            }
        }
        return false
    }
    public async sendDiscord(convo) {
        return {
            "content": "Here's the Link to my Discord => https://discord.gg/jxRR8FfrMN",
            "role": "assistant"
        };
    }
    public async amINeeded(convo) {
        const triggerTerms = [
            "give me the discord link ",
            "send me the discord link",
            "discord link",
            "your discord",
            "ur discord",
            "discord link please",
            "your discord link",
            "ur discord link"
        ];
        let arms = new ChatGPTArms();
        if (await arms.is_cos_sim_close(convo.chatQuery, triggerTerms, .85)) {
            return 1;
        }
        return false;

    }
}