const njk = require("nunjucks");

const tpl = `
  <xml>
    <ToUserName><![CDATA[{{ toUserName }}]]></ToUserName>
    <FromUserName><![CDATA[{{ fromUserName }}]]></FromUserName>
    <CreateTime>{{ createTime }}</CreateTime>
    <MsgType><![CDATA[{{ msgType }}]]></MsgType>
    {% if msgType === "text" %}
    <Content><![CDATA[{{ content }}]]></Content>
    {% elif msgType === "image" %}
      <Image>
        <MediaId><![CDATA[{{ content.mediaId }}]]></MediaId>
      </Image>
    {% elif msgType === "voice" %}      
      <Voice>
        <MediaId><![CDATA[{{ content.mediaId }}]]></MediaId>
      </Voice>
    {% elif msgType === "video" %}
      <Video>
        <MediaId><![CDATA[{{ content.mediaId }}]]></MediaId>
        <Title><![CDATA[{{ content.title }}]]></Title>
        <Description><![CDATA[{{ content.description }}]]></Description>
      </Video> 
    {% elif msgType === "music" %}
      <Music>
        <Title><![CDATA[{{ content.title }}]]></Title>
        <Description><![CDATA[{{ content.description }}]]></Description>
        <MusicUrl><![CDATA[{{ content.musicUrl }}]]></MusicUrl>
        <HQMusicUrl><![CDATA[{{ content.hqMusicUrl }}]]></HQMusicUrl>
        {% if content.mediaId %}
        <ThumbMediaId><![CDATA[{{ content.mediaId }}]]></ThumbMediaId>
        {% endif %}
      </Music>
    {% elif msgType === "news" %}
      <ArticleCount>{{ content.length }}</ArticleCount>
      <Articles>
      {% for item in content %}
        <item>
          <Title><![CDATA[{{ item.title }}]]></Title> 
          <Description><![CDATA[{{ item.description }}]]></Description>
          <PicUrl><![CDATA[{{ item.picUrl }}]]></PicUrl>
          <Url><![CDATA[{{ item.url }}]]></Url>
        </item>
      {% endfor %}
      </Articles>
    {% endif %}
  </xml>`;

const autoReplyTpl = njk.compile(tpl);

module.exports = {
  autoReplyTpl,
};
