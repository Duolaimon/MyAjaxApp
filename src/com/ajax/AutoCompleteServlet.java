package com.ajax;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;

/**
 * @author deity
 *         16-11-30 下午8:51
 */
@WebServlet(urlPatterns = "/autocomplete")
public class AutoCompleteServlet extends HttpServlet {
    private ComposerData compData = new ComposerData();
    private HashMap composers = compData.getComposers();
    private ServletContext context;
    @Override
    public void init(ServletConfig config) throws ServletException {
        this.context = config.getServletContext();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        String targetId = request.getParameter("id");
        StringBuilder sb = new StringBuilder();

        if (targetId != null) {
            targetId = targetId.trim().toLowerCase();
        } else {
            context.getRequestDispatcher("/error.jsp").forward(request, response);
        }

        boolean namesAdded = false;
        if (action.equals("complete")) {

            // check if user sent empty string
            if (!(targetId != null && targetId.equals(""))) {

                for (Object o : composers.keySet()) {
                    String id = (String) o;
                    Composer composer = (Composer) composers.get(id);

                    if (targetId != null && (composer.getFirstName().toLowerCase().startsWith(targetId) ||
                            // targetId matches last name
                            composer.getLastName().toLowerCase().startsWith(targetId) ||
                            // targetId matches full name
                            composer.getFirstName().toLowerCase().concat(" ")
                                    .concat(composer.getLastName().toLowerCase()).startsWith(targetId))) {

                        sb.append("<composer>");
                        sb.append("<id>").append(composer.getId()).append("</id>");
                        sb.append("<firstName>").append(composer.getFirstName()).append("</firstName>");
                        sb.append("<lastName>").append(composer.getLastName()).append("</lastName>");
                        sb.append("</composer>");
                        namesAdded = true;
                    }
                }
            }

            if (namesAdded) {
                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write("<composers>" + sb.toString() + "</composers>");
            } else {
                //nothing to show
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        }
        if (action.equals("lookup")) {

            // put the target composer in the request scope to display
            if ((targetId != null) && composers.containsKey(targetId.trim())) {
                request.setAttribute("composer", composers.get(targetId));
                context.getRequestDispatcher("/composer.jsp").forward(request, response);
            }
        }
    }
}
