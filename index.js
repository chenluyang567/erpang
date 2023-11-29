var fileKu = ['./scripts/runtime.js', './scripts/374.js', './scripts/reader.js', './scripts/swasm.js', './scripts/i18n.js', './scripts/pdf.js']



// 增加静态资源资源引入
function Require(file) {
    var html_doc = window.document.getElementsByTagName('head')[0];
    js = window.document.createElement('script');
    // js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', file);
    html_doc.appendChild(js);
}


// 引插件
for (var i = 0; i < fileKu.length; i++) {
    Require(fileKu[i])

}








class YY {


    // 打开ofd某页

    /*
    file：文件流
    page：需要打开第几页(1次只能打开一页)
    canvasDocument：渲染的结点id
    dpi：修改图片大小质量
    */

    async OpenPage(file, pages, canvasDocument, dpi = 96) {
        console.log(file.type)

        // 判断文件类型
        if (file.type.includes('ofd')) {
            // 解析ofd返回xml
            var doc = await window.SWOFD.open(file)


            // 文章页数共计几页  doc.pageCount

            const page = await doc.pageAt(parseInt(pages - 1));
            console.log(doc.pageCount, '文章页数共计 ')

            let canvas = document.getElementById(canvasDocument)
            await page.render(canvas, { dpi, rotate: 0 })
        } else if (file.type.includes('pdf')) {



            let fileURL = URL.createObjectURL(file);
            var loadingTask = pdfjsLib.getDocument(fileURL);
            let pdf = await loadingTask.promise;



            await pdf.getPage(pages).then(async function (page) {

                // 大小分辨率
                var scale = 1.5;
                var viewport = await page.getViewport({ scale: scale });

                let canvas = document.getElementById(canvasDocument)

                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;


                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    console.log('Page rendered');
                });
            });






        }







    }






    // 打开ofd整个文档

    /*
    file：文件流
    FatherDocument：渲染的父级盒子dom的id (string)
    LodingPage: 一次加载几页
    LoadingPage:第几次加载
    DocFile:ofd解析的xml（加载多次的时候传）
    */

    async OpenOfd(file = null, FatherDocument, LodingPage = 0, LoadingPage = 0, DocFile = null) {
        // 获取其父级盒子
        let Father = document.getElementById(FatherDocument)


        // 无需懒加载
        if (!LodingPage && !LoadingPage) {
            // 解析ofd返回xml
            var doc = await window.SWOFD.open(file)

            // 循环渲染
            for (let index = 0; index < doc.pageCount; index++) {
                // 文章页数共计几页  doc.pageCount
                const page = await doc.pageAt(parseInt(index));


                let canvas = document.createElement('canvas');
                canvas.id = 'chenOFD' + index
                Father.appendChild(canvas);



                await page.render(canvas, { dpi: 96, rotate: 0 })


            }

            return true

        } else {
            // 判断是否为最后一页












            return doc

        }









    }





}










// export default new YY







