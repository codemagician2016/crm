import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React from "react";

interface IEditor {
    value: string,
    onChange: any,
}

const Editor = ({
    value,
    onChange,
}: IEditor) => {
    
    const handleEditorReady = (editor: any) => {
        try {
            editor?.keystrokes?.set('Enter', (keyEvtData: any, cancel: any) => {
                // Prevent default behavior (new paragraph creation)
                cancel();

                editor.execute('enter');
            });

            editor?.keystrokes?.set('Shift+Enter', (keyEvtData: any, cancel: any) => {
                // Prevent default behavior (new paragraph creation)
                cancel();

                editor.execute('shiftEnter');
            });
        } catch (error) {
            console.log("editor error", error)
        }
    }

    return (
        <div>
            <CKEditor
                editor={ClassicEditor as any}
                config={{
                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList'],
                    heading: {
                        options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading3', view: 'h3', title: 'Heading', class: 'ck-heading_heading3' },
                        ]
                    }
                }}
                data={value}
                onChange={onChange}
                onReady={handleEditorReady}
            />
        </div>
    );
};

export default Editor;