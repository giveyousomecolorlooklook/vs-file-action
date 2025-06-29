import argparse
import sys
from typing import List, Optional
from cnocr import CnOcr

def parse_args(args: Optional[List[str]] = None) -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='OCR中文识别CLI工具',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # 添加参数
    parser.add_argument('-i', '--input', 
                      help='输入图片路径',
                      required=True)
    parser.add_argument('-o', '--output',
                      help='输出文本路径',
                      default='output.txt')
    parser.add_argument('--debug',
                      help='开启调试模式',
                      action='store_true')
    
    return parser.parse_args(args)




def main():
    """主函数入口"""
    try:
        args = parse_args()
        
        print("初始化 OCR...")
        ocr = CnOcr()
        
        print(f"处理输入文件: {args.input}")
        print("开始识别图片...")
        result = ocr.ocr(args.input)
        
        if not result:
            print("警告: 未识别到任何文本")
            return
            
        # 提取文本
        texts = [line['text'] for line in result]
        text_content = '\n'.join(texts)
        
        # 写入输出文件
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(text_content)
            
        print(f"识别结果已保存到: {args.output}")
        if args.debug:
            print("调试模式已开启")
            print("识别到的文本内容:")
            print(text_content)
            
    except Exception as e:
        print(f"错误: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
